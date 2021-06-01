const { insertExplicitConcatOperator, toPostfix } = require('./parser');
const { toNFA, toNFAFromInfixExp, recognize } = require('./nfa');

function createMatcher(exp) {
    // Generates an NFA using a stack
    const expWithConcatenationOperator = insertExplicitConcatOperator(exp);
    const postfixExp = toPostfix(expWithConcatenationOperator);
    const nfa = toNFA(postfixExp);

    //Generates a DFA with Powerset Construction
    const dfa  = toDFA(nfa)
    const mDfa  = minimize(dfa)

    // Generates an NFA by constructing a parse tree
    // No explicit concatenation operator required
    //const nfa = toNFAFromInfixExp(exp);

    return word => recognize(mDfa, word);
}

module.exports = { createMatcher };
