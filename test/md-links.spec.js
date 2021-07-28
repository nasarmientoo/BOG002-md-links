const index = require('../src/index.js');
const path = 'src/example-directory'
const array = [
  {
    href: 'https://github.com/markdown-it/markdown-it',
    text: 'markdown-it',
    file: 'C:\\Users\\EQUIPO\\Documents\\LABORATORIA\\BOG002-md-links\\src\\example-directory\\example.md'
  },
  {
    href: 'https://nodejs.org/es/about/',
    text: 'Acerca de Node.js - Documentación oficial',
    file: 'C:\\Users\\EQUIPO\\Documents\\LABORATORIA\\BOG002-md-links\\src\\example-directory\\full-directory\\example(1).md'
  }
]

describe('mdLinks', () => {
  it('should be a function', () => {
    expect(typeof index.mdLinks).toBe('function')
  });

  it('should return a promise', () => {
    expect(index.mdLinks(path) instanceof Promise).toBeTruthy();
  })

  it('should return an array of objects', () => {
    return index.mdLinks(path).then((data) =>{
      expect(data).toEqual(array)
    })
  })
});



