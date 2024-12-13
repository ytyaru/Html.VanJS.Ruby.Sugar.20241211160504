class Comparer {
    constructor(L,R) {this._L=L;this._R=R;}
    get L() {return this._L} // left
    get R() {return this._R} // right
    get e() {return this._L===this._R} // equal
    get n() {return this._L!==this._R} // not-equal
    get g() {return this._L > this._R} // great
    get l() {return this._L < this._R} // less
    get ge() {return this._L >= this._R} // great
    get le() {return this._L <= this._R} // less
}
