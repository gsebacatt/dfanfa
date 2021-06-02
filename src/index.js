const { createMatcher } = require('./regex');
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
//
// rl.question(`Cadena: `, (pattern) => {
//     const match = createMatcher(pattern);
//
//
//     rl.on('line', (input) => {
//         console.log(`Match? ${match(input)}`);
//     });
// });


var lineArray = [];
//Diccionario con los tokens y los matchers de esos tokens
let tokens = {};

let myInterface = readline.createInterface({
    input: fs.createReadStream('src/file.txt')
});

myInterface.on('line', function (line) {
    console.log(line)
    lineArray.push(line);
})

myInterface.on('close', function() {

    lineArray.forEach(line => {
        let regex = getRegex(line);

        let matcher  = createMatcher(regex);

        let token = getToken(line);

        tokens[token] = matcher;

    })

    console.log(tokens)

    rl.question("Cadena : " , (pattern) => {

        for ( const [key, value] of Object.entries(tokens)){
            console.log(key + ": ")
            console.log(value(pattern))
        }

    })

})

function getToken(line){
    return line.split('->')[0]
}

function getRegex(line){
    return line.split('->')[1]
}




