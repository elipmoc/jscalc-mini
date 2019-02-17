
//計算ボタンが押された時にbuttonClickが呼ばれるようにする
document.getElementById("button").onclick = buttonClick;

//計算ボタンが押された時に呼ばれる関数
function buttonClick() {
    const results = calc(document.getElementById("input").value);
    const tokenResult =
        document.getElementById("tokenResult");
    tokenResult.value = "";
    for (const token of results.tokenList)
        tokenResult.value += `${token.tokenType} : ${token.value}\r\n`;
    document.getElementById("calcResult").value = results.calcResult;
}

//文字列を解析して計算結果を返す関数
function calc(inputStr) {
    const tokenList = lexicalAnalysis(inputStr);
    if (tokenList === null)
        return { tokenList: [], calcResult: "字句解析が失敗しました" };
    const exprTree = syntacticAnalysis(tokenList);
    if (exprTree === null)
        return { tokenList, calcResult: "構文解析が失敗しました" };
    return { tokenList, calcResult: exprTree.result() };
}


//字句解析---------------------------------------------------------------------------
function lexicalAnalysis(inputStr) {
    const tokenList = [];
    while (inputStr.length !== 0) {
        if (addToken(numCut()));
        else if (addToken(opCut()));
        else return null;
    }
    return tokenList;

    //トークンの追加
    function addToken(parseResult) {
        if (parseResult !== null) {
            tokenList.push({
                value: parseResult.value,
                tokenType: parseResult.tokenType
            });
            return true;
        }
        return false;
    }

    //数字の切り出し
    function numCut() {
        let i = 0;
        let buf = "";
        while (isNaN(inputStr[i]) === false) {
            buf += inputStr[i];
            i++;
        }
        if (i > 0) {
            const token = {
                value: Number(buf),
                tokenType: "num"
            };
            inputStr = inputStr.slice(i);
            return token;
        }
        return null;
    }

    //演算子の切り出し
    function opCut() {
        if (
            ["+", "-", "*", "/"].includes(inputStr[0])
        ) {
            const token = {
                value: inputStr[0],
                tokenType: "op"
            };
            inputStr = inputStr.slice(1);
            return token;
        }
        return null;
    }
}


/*構文解析---------------------------------------------------------------------------

BNF記法

<num> ::= (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)+
<expr>::= <term> { ('+' | '-') <term> }
<term>::= <num> { ('*' | '/') <num> }
*/

//数値を返すだけの式木
class NumExpr {
    constructor(num) {
        this.num = num;
    }
    result() {
        return this.num;
    }
}

//2つの式に演算子を適応した結果を返す式木
class OpExpr {
    constructor(leftExpr, rightExpr, opChar) {
        this.leftExpr = leftExpr;
        this.rightExpr = rightExpr;
        this.opChar = opChar;
    }
    result() {
        const [left, right] = [this.leftExpr.result(), this.rightExpr.result()];
        switch (this.opChar) {
            case "+":
                return left + right;
            case "-":
                return left - right;
            case "*":
                return left * right;
            case "/":
                return left / right;
        }
    }
}

//構文解析をする関数
function syntacticAnalysis(tokenList) {
    let index = 0;
    return exprParser();

    //<expr>の構文解析
    function exprParser() {
        let expr = termParser();
        if (expr === null) return null;
        while (index < tokenList.length) {
            const opChar = tokenList[index].value;
            if (["+", "-"].includes(opChar) === false) return expr;
            index++;
            const expr2 = termParser();
            if (expr2 === null) return null;
            expr = new OpExpr(expr, expr2, opChar);
        }
        return expr;
    }

    //<term>の構文解析
    function termParser() {
        let expr = numParser();
        if (expr === null) return null;
        while (index < tokenList.length) {
            const opChar = tokenList[index].value;
            if (["*", "/"].includes(opChar) === false) return expr;
            index++;
            const expr2 = numParser();
            if (expr2 === null) return null;
            expr = new OpExpr(expr, expr2, opChar);
        }
        return expr;
    }

    //<num>の構文解析
    function numParser() {
        const token = tokenList[index];
        if (tokenList.length > index && token.tokenType === "num") {
            index++;
            return new NumExpr(token.value);
        }
        return null;
    }
}
