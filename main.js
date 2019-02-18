
//計算ボタンが押された時にbuttonClickが呼ばれるようにする
document.getElementById("button").onclick = buttonClick;

//計算ボタンが押された時に呼ばれる関数
function buttonClick() {
    // document.getElementById("タグid").value でテキストボックスなどに入力された値を取得できる。
    const result = calc(document.getElementById("input").value);
    //トークンリストを字句解析結果テキストエリアに表示させる
    document.getElementById("tokenResult").value = tokenListToString(result.tokenList);
    document.getElementById("calcResult").value = result.calcResult;
}

//tokenListを文字列に結合して返す
function tokenListToString(tokenList) {
    let str = "";
    for (const token of tokenList)
        //JavaScriptのテンプレートリテラルという機能を使用「`」はバッククォートと読む
        str += `${token.tokenType} : ${token.value}\r\n`;
    return str;

    /*別解

    たった一行で書けるスマートな方法
    return tokenList.reduce((acc, token) => acc + `${token.tokenType} : ${token.value}\r\n`, "");

    */
}

//文字列を解析して計算結果を返す関数
function calc(inputStr) {
    //トークンリストの取得
    const tokenList = lexicalAnalysis(inputStr);
    if (tokenList === null)
        return { tokenList: [], calcResult: "字句解析が失敗しました" };
    //式木の取得
    const exprTree = syntacticAnalysis(tokenList);
    if (exprTree === null)
        return { tokenList: tokenList, calcResult: "構文解析が失敗しました" };
    //計算結果を返す
    return { tokenList: tokenList, calcResult: exprTree.result() };
    // return { tokenList, calcResult: exprTree.result() };でもOK(キーと変数名が一緒なら省略できる)
}


//字句解析---------------------------------------------------------------------------
function lexicalAnalysis(inputStr) {
    const tokenList = [];
    // 文字列の長さが0になるまで切り出し続ける
    while (inputStr.length !== 0) {
        if (addToken(numCut()));
        else if (addToken(opCut()));
        else return null;
    }
    return tokenList;

    //トークンの追加
    function addToken(parseResult) {
        if (parseResult !== null) {
            tokenList.push(parseResult);
            return true;
        }
        return false;
    }

    //数値トークンの切り出し
    //トークンオブジェクトかnullのどちらかを返す
    function numCut() {
        let i = 0;
        let buf = "";
        //isNaNで文字が数字かどうか判定できる
        //数字じゃなくなるまでbufに詰め続ける
        while (isNaN(inputStr[i]) === false) {
            buf += inputStr[i];
            i++;
        }
        if (i > 0) {
            const token = {
                value: Number(buf),
                tokenType: "num"
            };
            //slice(x)で先頭からx個だけ取り除いた文字列を取得できる
            inputStr = inputStr.slice(i);
            return token;
        }
        return null;
    }

    //演算子トークンの切り出し
    //トークンオブジェクトかnullのどちらかを返す
    function opCut() {
        if (
            ["+", "-", "*", "/"].includes(inputStr[0])
        ) {
            const token = {
                value: inputStr[0],
                tokenType: "op"
            };
            //slice(x)で先頭からx個だけ取り除いた文字列を取得できる
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
        //JavaScriptの分割代入という機能を使用
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
    //OpExprかnullのどちらかを返す
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
    //OpExprかnullのどちらかを返す
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
    //NumExprかnullのどちらかを返す
    function numParser() {
        const token = tokenList[index];
        if (tokenList.length > index && token.tokenType === "num") {
            index++;
            return new NumExpr(token.value);
        }
        return null;
    }
}
