// eslint-disable-file
const path = require('path');
const fs = require('fs');
const markdownLinkExtractor = require('markdown-link-extractor');
const axios = require('axios');

/* Función de recolección de rutas con formato .md */

const getFiles = (route, filesArray) => {
    const absolutRoute = path.resolve(route);
    if (fs.existsSync(absolutRoute) && fs.lstatSync(absolutRoute).isDirectory()) {
        let files = fs.readdirSync(absolutRoute)
        for (let file in files) {
            let nextFile = path.join(absolutRoute, files[file]);
            if (path.extname(files[file]) === ".md") { filesArray.push(path.resolve(absolutRoute, files[file])) }
            if (fs.lstatSync(nextFile).isDirectory()) { getFiles(nextFile, filesArray) }
        }
    }
    if (fs.existsSync(absolutRoute) && path.extname(absolutRoute) === ".md") { filesArray.push(absolutRoute) }
    return filesArray
}

/* Función de lectura de rutas .md recolectadas*/
const readFiles = files => {
    const textPromise = files.map(path => fs.promises.readFile(path, 'utf8'));
    return Promise.all(textPromise)
        .then(text => text.map((item, index) =>
            ({
                text: item,
                file: files[index]
            })
        ))
}


/*Función de recolección de los links en los archivos*/
const getLinks = objectFilesArray => {
    return objectFilesArray
        .filter(item => item.text !== '')
        .flatMap(item => markdownLinkExtractor(item.text, true)
            .filter(item => item.href.startsWith('http'))
            .map(link =>
                ({
                    href: link.href,
                    text: link.text,
                    file: item.file
                })
            )
        )
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
                    /* 404 para url no existentes */
                    statusText: 'fail'
                }
            })
    })
    return Promise.all(axiosPromises)
}


/*Función de validación md -links */
const mdLinks = (path, options = { validate: false }) => {
    const files = getFiles(path, [])
    return readFiles(files)
        .then(getLinks)
        .then(object => {
            if (options.validate) {
                return validateLinks(object)
            } else {
                return object
            }
        })
        .catch((error) => {
            console.log(error)
            return 'No se puede ejecutar Md-links'
        })

}

mdLinks('src/example-directory', { validate: true }).then(data => console.log(data))
module.exports = { mdLinks }