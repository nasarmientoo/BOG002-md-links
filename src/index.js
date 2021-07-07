const path = require('path');
const fs = require('fs'); 
const fsPromises = require('fs').promises;

/* Función para  de ruta como directorio/archivo */
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

   
/* Función para leer los archivos encontrados */
const readFiles = (files) => {
    console.log(files)
    files.map(function(path){
        fs.promises.readFile(path,'utf8')
        .then(data => console.log('[+]',path, data))
        .catch(error => console.log('Error: ', error))
    })
}

console.log(getFiles('src/example-directory'))
//