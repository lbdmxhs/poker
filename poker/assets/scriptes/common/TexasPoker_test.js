var Poker = function (n) {
    this.num = (n % 13) + 2;
    this.ch = this.num > 9 ? ("abcdef"[this.num - 10]) : this.num;
    this.show = "0,1,2,3,4,5,6,7,8,9,10,J,Q,K,A".split(",")[this.num];
    this.color = "♠♥♣♦"[n / 13 | 0];
    this.toString = function () {
        return this.color + this.show;
    };
};
var z = function (arg) { //同花顺
    var a = arg,
        t = a[0];
    for (var i = 1; i < a.length; i++) {
        if (a[i].color === t.color && a[i].num === t.num + 1) {
            t = a[i];
        } else if (i === a.length - 1 && t.num === 5 && a[i].num === 14 && a[i].color === t.color) {
            t = a[0];
        } else {
            return;
        }
    };
    return "z" + t.ch;
};
var y = function (arg) { //四条
    var a = arg.map(function (p) {
        return p.ch;
    }).join(""),
        mat = a.match(/(\w*)(\w)\2\2\2(\w*)/);
    if (mat) {
        return "y" + mat[2] + mat[1] + mat[3];
    }
};
var x = function (arg) { //葫芦
    var a = arg.map(function (p) {
        return p.ch;
    }).join(""),
        mat;
    if (mat = a.match(/(\w)\1(\w)\2\2/)) {
        return "x" + mat[2] + mat[1];
    } else if (mat = a.match(/(\w)\1\1(\w)\2/)) {
        return "x" + mat[1] + mat[2];
    }
};
var w = function (arg) { //同花
    var a = arg,
        t = a[0];
    for (var i = 1; i < a.length; i++) {
        if (a[i].color === t.color) {
            t = a[i];
        } else {
            return;
        }
    };
    return "w" + arg.map(function (p) {
        return p.ch;
    }).join("");
};
var v = function (arg) { //顺子
    var a = arg, t = a[0];
    for (var i = 1; i < a.length; i++) {
        if (a[i].num === t.num + 1) {
            t = a[i];
        } else if (i === a.length - 1 && t.num === 5 && a[i].num === 14) {
            t = a[0];
        } else {
            return;
        }
    };
    return "v" + t.ch;
};
var u = function (arg) { //三条
    var a = arg.map(function (p) {
        return p.ch;
    }).join(""),
        mat;
    if (mat = a.match(/(\w*)(\w)\2\2(\w*)/)) {
        return "u" + mat[2] + mat[1] + mat[3];
    }
};
var t = function (arg) { //两对
    var a = arg.map(function (p) {
        return p.ch;
    }).join(""),
        mat;
    if (mat = a.match(/(\w*)(\w)\2(\w)\3(\w*)/)) {
        return "t" + mat[3] + mat[2] + mat[1] + mat[4];
    } else if (mat = a.match(/(\w)\1(\w)(\w)\3/)) {
        return "t" + mat[3] + mat[1] + mat[2];
    }
};
var s = function (arg) { //一对
    var a = arg.map(function (p) {
        return p.ch;
    }).join(""),
        mat;
    if (mat = a.match(/(\w*)(\w)\2(\w*)/)) {
        return "s" + mat[2] + mat[1] + mat[3];
    }
};
var r = function (arg) { //高牌
    return arg.map(function (p) {
        return p.ch;
    }).join("");
};
var score = function () {
    var a = [].map.call(arguments, function (p) {
        return new Poker(p);
    }).sort(function (p1, p2) {
        return p1.num - p2.num;
    });
    console.log(a.join(","));
    return z(a) || y(a) || x(a) || w(a) || v(a) || u(a) || t(a) || s(a) || r(a);
};