const path = require('path');
const fs = require('fs'); 
const fsPromises = require('fs').promises;
const markdownLinkExtractor = require('markdown-link-extractor');

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
    if(fs.existsSync(absolutRoute) && path.extname(absolutRoute) === ".md"){
        filesArray.push(absolutRoute)
    }
    return filesArray
}

/* Función de lectura de rutas .md recolectadas*/
const readFiles = async (files) => {
    const textPromise = files.map(function(path){
        return (fs.promises.readFile(path,'utf8'))
    });
    const textArray = await Promise.all(textPromise);
    const text = textArray.join();
    return text
}


/*Función de recolección de los links en los archivos*/
const getLinks = async (files) => {
    const content = await readFiles(files)
    const links = markdownLinkExtractor(content, true);
    links.forEach(link => console.log(link))
} 

//console.log(getLinks(readFiles(getFiles('src/example-directory'))))
//console.log(getFiles('src/example-directory'))
getLinks(getFiles('README.md'))