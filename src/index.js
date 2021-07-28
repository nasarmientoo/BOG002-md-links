// eslint-disable-file
const path = require('path');
const fs = require('fs');
const markdownLinkExtractor = require('markdown-link-extractor');
const axios = require('axios');

/* Función de recolección de rutas con formato .md */

const getFiles = (route,filesArray) => {
    const absolutRoute = path.resolve(route);
    if (fs.existsSync(absolutRoute) && fs.lstatSync(absolutRoute).isDirectory()) {
        let files = fs.readdirSync(absolutRoute)
        for (let file in files) {
            let nextFile = path.join(absolutRoute, files[file]);
            if (path.extname(files[file]) === ".md") {filesArray.push(path.resolve(absolutRoute, files[file]))}
            if (fs.lstatSync(nextFile).isDirectory()) {getFiles(nextFile,filesArray)}
        }
    }
    if (fs.existsSync(absolutRoute) && path.extname(absolutRoute) === ".md") {filesArray.push(absolutRoute)}
    return filesArray
}

const getFilesArray = route => {
    const filesArray = []
    return getFiles(route,filesArray)
}


/* Función de lectura de rutas .md recolectadas*/
const readFiles = files => {
    const textPromise = files.map(function (path) {
        return fs.promises.readFile(path, 'utf8')
    });
    return Promise.all(textPromise).then(text => {
        const propertiesArray = text.map((item, index) => {
            const object = {
                text: item,
                file: files[index]
            }
            return object
        })
        return propertiesArray
    })
}


/*Función de recolección de los links en los archivos*/
const getLinks = objectFilesArray => {
    const fillFiles = objectFilesArray.filter(item => item.text !== '')
    const links = fillFiles.flatMap(item => {
        const linksArray = []
        const linkDetails = markdownLinkExtractor(item.text, true);
        linkDetails.forEach(link => {
            if (link.href.startsWith('http')) {
                const objectLink = {
                    href: link.href,
                    text: link.text,
                    file: item.file
                }
                linksArray.push(objectLink)
            }
        });
        return linksArray
    })
    return links
}


/*Función de validación de los links recolectados*/
const validateLinks = files => {
    const axiosPromises = files.map(object => {
        return axios.get(object.href)
            .then(response => {
                return successObject = {
                    ...object,
                    status: response.status,
                    statusText: 'ok'
                }
            })
            .catch(error => {
                return failObject = {
                    ...object,
                    status: error.response.status,
                    statusText: 'fail'
                }
            })
    })
    return Promise.all(axiosPromises)
}


/*Función de validación md -links */
const mdLinks = (path,options = {validate:false}) => {
    const files = getFilesArray(path)
    return readFiles(files)
    .then(getLinks)
    .then(object =>{
        if (options.validate){
            return validateLinks(object)
        }else{
            return object
        }
    })
    .catch((error) => {
        console.log(error)
        return 'No se puede ejecutar Md-links'
    })

}

//mdLinks('src/example-directory',{validate:false}).then(data => console.log(data))
module.exports = {mdLinks} 