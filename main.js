
//計算ボタンが押された時にbuttonClickが呼ばれるようにする
document.getElementById("button").onclick = buttonClick;

//計算ボタンが押された時に呼ばれる関数
function buttonClick() {
    let results = calc(document.getElementById("input").value);
    let tokenResult =
        document.getElementById("tokenResult");
    tokenResult.value = "";
    for (let token of results.tokenList)
        tokenResult.value += token.tokenType + " : " + token.value + "\r\n";
    document.getElementById("calcResult").value = results.calcResult;
}

//文字列を解析して計算結果を返す関数
function calc(inputStr) {
    let results = {};
    results.tokenList = lexicalAnalysis(inputStr);
    let syntacticResult = syntacticAnalysis(results.tokenList);
    results.calcResult = syntacticResult == null ? "構文解析が失敗しました" : syntacticResult.result();
    return results;
}


//字句解析---------------------------------------------------------------------------
function lexicalAnalysis(inputStr) {
    let tokenList = new Array();
    while (inputStr.length != 0) {
        if (addToken(numParser()));
        else if (addToken(opParser()));
        else {
            tokenList.push({ tokenType: "error", value: "字句解析が失敗しました" });
            return tokenList;
        }
    }
    return tokenList;

    function addToken(parseResult) {
        if (parseResult != null) {
            tokenList.push({
                value: parseResult.value,
                tokenType: parseResult.tokenType
            });
            return true;
        }
        return false;
    }

    function numParser() {
        let i = 0;
        let buf = "";
        while (isNaN(inputStr[i]) == false) {
            buf += inputStr[i];
            i++;
        }
        if (i > 0) {
            let result = {
                value: Number(buf),
                tokenType: "num"
            };
            inputStr = inputStr.slice(i);
            return result;
        }
        return null;
    }

    function opParser() {
        if (
            inputStr[0] == "+" ||
            inputStr[0] == "-" ||
            inputStr[0] == "*" ||
            inputStr[0] == "/"
        ) {
            let result = {
                value: inputStr[0],
                tokenType: "op"
            };
            inputStr = inputStr.slice(1);
            return result;
        }
        return null;
    }
}


/*構文解析---------------------------------------------------------------------------
/*

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
    constructor(leftExpr, rightExpr, op) {
        this.leftExpr = leftExpr;
        this.rightExpr = rightExpr;
        this.op = op;
    }
    result() {
        switch (this.op) {
            case "+":
                return this.leftExpr.result() + this.rightExpr.result();
            case "-":
                return this.leftExpr.result() - this.rightExpr.result();
            case "*":
                return this.leftExpr.result() * this.rightExpr.result();
            case "/":
                return this.leftExpr.result() / this.rightExpr.result();
        }
    }
}

//構文解析をする関数
function syntacticAnalysis(tokenList) {
    let index = 0;
    return exprParser();

    function exprParser() {

        let expr = termParser();
        if (expr == null) return null;
        while (index < tokenList.length) {
            let op = tokenList[index];
            if (op.value != "+" && op.value != "-") return expr;
            index++;
            let expr2 = termParser();
            if (expr2 == null) return null;
            expr = new OpExpr(expr, expr2, op.value);
        }
        return expr;
    }

    function termParser() {
        let expr = numParser();
        if (expr == null) return null;
        while (index < tokenList.length) {
            let op = tokenList[index];
            if (op.value != "*" && op.value != "/") return expr;
            index++;
            let expr2 = numParser();
            if (expr2 == null) return null;
            expr = new OpExpr(expr, expr2, op.value);
        }
        return expr;
    }

    function numParser() {
        if (tokenList.length > index && tokenList[index].tokenType == "num") {
            let numExpr = new NumExpr(tokenList[index].value);
            index++;
            return numExpr;
        }
        return null;
    }
}

