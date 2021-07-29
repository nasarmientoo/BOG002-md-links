#!/usr/bin/env node

const chalk = require('chalk')
const yargs = require('yargs');
const mdLinks = require('./index.js')

const path = process.argv[2]
console.log(chalk.yellow(path))

const argv = yargs
    .usage('Usage: md-links <path to file> [options]')
    .option('validate', {
        alias: 'validate',
        description: 'validate links',
        type: 'boolean',
        mode: false
    })
    .option('stats', {
        alias: 'stats',
        description: 'links statistics',
        type: 'boolean',
        mode: false
    })
    .help()
    .alias('-help')
    .argv;

if (!path) { console.log('enter a route') }
if (argv.stats && argv.validate) {
    mdLinks(path, { validate: true })
        .then(data => {
            const total = data.length
            const uniqueLink = [...new Set(data.map((link) => link.link))]
            const Unique = uniqueLink.length
            const searchbroken = data.filter((link) => link.statusText !== 'OK')
            const broken = searchbroken.length
            console.table({ total, Unique, broken })
        })
}
if (argv.stats) {
    mdLinks(path, { validate: true })
        .then(data => {
            const total = data.length
            const uniqueLink = [...new Set(data.map((link) => link.link))]
            const Unique = uniqueLink.length
            console.table({ total, Unique })
        })
}
if (argv.validate) {
    mdLinks(path, { validate: true })
        .then(data => {
            const total = data.length
            const uniqueLink = [...new Set(data.map((link) => link.link))]
            const Unique = uniqueLink.length
            const searchbroken = data.filter((link) => link.statusText !== 'OK')
            const broken = searchbroken.length
            console.table({ total, Unique, broken })
        })
} else {
    mdLinks(path, { validate: false })
        .then(console.log)
}