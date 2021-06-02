const { insertExplicitConcatOperator, toPostfix } = require('./parser');
const { toNFA, toNFAFromInfixExp, recognize } = require('./nfa');
const {toDfa, getEClosure, mover}  = require('./dfa');

function createMatcher(exp) {
    // Genera un NFA usando un stack
    const expWithConcatenationOperator = insertExplicitConcatOperator(exp);
    const postfixExp = toPostfix(expWithConcatenationOperator);
    const nfa = toNFA(postfixExp);

   // console.log(getEClosure(nfa.start))

    //Genera un DFA mediante construccion de subconjuntos
    //const dfa  = toDfa(nfa)
    //const mDfa  = minimize(dfa)

    //Reconoce la cadena con el nda, dfa o dfa minimizado
    return word => recognize(nfa, word);
}

module.exports = { createMatcher };
