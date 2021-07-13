const path = require('path');
const fs = require('fs'); 
const fsPromises = require('fs').promises;
const markdownLinkExtractor = require('markdown-link-extractor');
const axios = require('axios')

/* Función de recolección de rutas con formato .md */
let filesArray = []
const getFiles = (route) =>{
    const absolutRoute = path.resolve(route);
    //console.log('[+]',absolutRoute)
    if (fs.existsSync(absolutRoute) && fs.lstatSync(absolutRoute).isDirectory()){
        let files = fs.readdirSync(absolutRoute)
        for( let file in files){
            let nextFile = path.join(absolutRoute, files[file]);
            if(path.extname(files[file]) === ".md"){
                //console.log('[-]',path.resolve(absolutRoute,files[file]))
                filesArray.push(path.resolve(absolutRoute,files[file]))
            }   
            if(fs.lstatSync(nextFile).isDirectory()){
                getFiles(nextFile)
            }
        }
    }
    if(fs.existsSync(absolutRoute) && path.extname(absolutRoute) === ".md"  ){
        filesArray.push(absolutRoute)
    }
    return filesArray
}


/* Función de lectura de rutas .md recolectadas*/
const readFiles = async (files) => {
    const textPromise = files.map(function(path){
        return fs.promises.readFile(path,'utf8')
    });
    return Promise.all(textPromise).then((text) =>{
        const propertiesArray = text.map((item,index)=>{
            const object = {
                text: item,
                path: files[index]
            }
            return object  
        })
        return propertiesArray
    })   
}

/*Función de recolección de los links en los archivos*/
const getLinks = async (files) => {
    return readFiles(files).then((content) =>{
        const fillFiles = content.filter(item => {
            return item.text !== ''
        })
        const links = fillFiles.map(item => {
            const linkDetails = markdownLinkExtractor(item.text, true);
            const linksArray = []
            linkDetails.forEach( link => {
                if (link.href.startsWith('http')){
                    const objectLink = {
                        href: link.href,
                        text: link.text,
                        file: item.path
                    }
                    linksArray.push(objectLink)
                }
            });
            return linksArray    
        })
        return links
    })
}

/*Función de validación de los links recolectados*/
const validateLinks = async (files) =>{
    return getLinks(files).then(array =>{
        return array.map( item => {
            item.forEach(object =>{
                const validateArray = []
                return axios.get(object.href)
                .then(response =>{
                    const successObject = {
                        href: object.href,
                        text: object.text,
                        file: object.file,
                        status: response.status,
                        statusText: 'ok'
                    }
                    validateArray.push(successObject) 
                    return validateArray  
                })
                .catch(error =>{
                    const failObject = {
                        href: object.href,
                        text: object.text,
                        file: object.file,
                        status: response.status,
                        statusText: 'fail'
                    }
                    validateArray.push(failObject) 
                    return validateArray
                })
           })         
        })
    })
}

validateLinks(getFiles('src/example-directory'))

module.exports = {
    getFiles,
    validateLinks
}