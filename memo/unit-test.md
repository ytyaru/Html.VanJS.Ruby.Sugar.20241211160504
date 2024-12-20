# 単体テスト

## パターン大分類

* 簡易構文（HTMLパース）
    * Ruby（Short, Long, 複数, 混在）
    * Em（単数、複数、混在）
* 簡易構文（エスケープ）
    * Ruby（Short, Long, 複数, 混在）
    * Em（単数、複数、混在）
* 対象外
    * そのまま出力

### Ruby.Short

　親文字がすべて漢字であること。

* Html.kanjisTwin 漢字一字ずつ上下にルビを振る
* Html.kanjis     漢字一字ずつルビ。任意で下にも
* Html.nest       上下に一つずつルビを振る
* Html.solo       上に一つルビを振る

### Ruby.Long

　開始位置に｜か↓があること。親文字の字種不問。

* 親文字に｜がある
    * Html.kanjiPipeCommas  親＆ルビ文字が｜で分割され、親文字がすべて漢字で、ルビ文字が,で分割されている
    * Html.pipes            親文字に｜があり、かつ上記以外
* 親文字に｜がない
    * ルビ文字に｜がない、親文字に漢字がある
        * 親文字が漢字のみ
            * Html.kanjisTwin   漢字一字ずつ両方にルビを振る
            * Html.kanjis       漢字一字ずつ片方にルビを振る
            * Html.nest         両方に一つずつルビを振る
            * Html.solo         片方に一つルビを振る
            * 
        * 親文字の字種不問
            * Html.kanjiGroups  漢字群のみルビ（漢字以外はそのまま出力する）
            * Html.twin         両方 に一つずつルビを振る        
            * Html.solo         片方に一つルビを振る
    * 他（ルビ文字に｜がある or 親文字に漢字がない）
        * Html.nest             ルビ文字に｜と,がある
        * Html.solo             ルビ文字に,がある
        * Html.nest             ルビ文字に｜がある
        * Html.solo             ルビ文字に｜や,がない

### Ruby

```
｜親文字《ルビ文字》
```
```html
<ruby>親文字<rt>ルビ文字</rt></ruby>
```
```html
<ruby>親文字<rp>（</rp><rt>ルビ文字</rt><rp>）</rp></ruby>
```

　実際に出力されるHTMLには`<rp>`ルビも含まれるが、今回は説明の便宜上`<rp>`を省いて表記する。

　RubyはShort系とLong系に大別できる。Longはルビ要素の開始位置を明記した形式であり、Shortはそれを省略した形式だ。

　Shortは親文字がすべて漢字の場合で、かつ｜を省略した形式。ルビ位置は必ず上(`over`)である。

```
親文字《ルビ文字》
```
```css
ruby-position:over;
```

　もしルビ位置を下(`over`)にしたければLong系になる。すなわちルビ開始位置に`↓`を入力する。以降、開始位置に`｜`を使う代わりに`↓`を使えばルビの位置が下になる。

```
↓親文字《ルビ文字》
```
```css
ruby-position:under;
```

　漢字が連続しているが、ルビ開始位置は途中からにしたい場合、｜を使って開始位置を明示する。

```
対象外｜山田《やまだ》
```

　漢字が連続しているが、氏名などで複数の漢字を別々の`<ruby>`に分割したい場合は、次のように表現できる。
　
```
｜山田《やまだ》太郎《たろう》
```

　上記と以下は同じHTMLになる別表現だ。以下のほうが人名というひと塊に対してルビを振っている感があって読みやすい。

```
｜山田｜太郎《やまだ｜たろう》
```
```html
<ruby>山田<rt>やまだ</rt></ruby>
<ruby>太郎<rt>たろう</rt></ruby>
```

　ちなみにルビの位置を下にするには以下。

```
↓山田｜太郎《やまだ｜たろう》
```
```html
<ruby style="ruby-position:under;">山田<rt>やまだ</rt></ruby>
<ruby style="ruby-position:under;">太郎<rt>たろう</rt></ruby>
```

　連続する漢字に対して一文字ずつルビを振りたい場合は、ルビ文字を`,`で区切る。その要素数は漢字数と同数であるべき。

```
山田太郎《やま,だ,た,ろう》
```
```
｜山田太郎《やま,だ,た,ろう》
```
```html
<ruby>山<rt>やま</rt></ruby>
<ruby>田<rt>だ</rt></ruby>
<ruby>太<rt>た</rt></ruby>
<ruby>郎<rt>ろう</rt></ruby>
```

　両方にルビを振りたい場合は、以下のようにルビ文字を`｜`で区切る。このとき親文字には`｜`を入れないこと。

```
山田太郎《やまだたろう｜ヤマさん》
```
```
｜山田太郎《やまだたろう｜ヤマさん》
```
```html
<ruby style="ruby-position:under;">
  <ruby style="ruby-position:over;">
    山田太郎
    <rt>やまだたろう</rt>
  </ruby>
  <rt>ヤマさん</rt>
</ruby>
```

　`<ruby>`の構造が複雑にみえるが、ようするにネスト（入れ子）である。`<ruby>`要素を二つ用いて中に入れることで上下の両方にルビを表示している。

　ルビは上下に二つあり、上に`やまだたろう`、下に`ヤマさん`を表示する。

　中にある`<ruby>`は、上に`やまだたろう`を表示する。これを親文字として、それに対して下に`ヤマさん`のルビを振ったのが外側の`<ruby>`である。`style`属性の末尾にある`under`や`over`がルビの表示位置を示している。

　ちなみにこのルビの上下を逆転させるなら、開始位置の`｜`を`↓`にすると実現できる。

```
↓山田太郎《やまだたろう｜ヤマさん》
```
```html
<ruby style="ruby-position:over;">
  <ruby style="ruby-position:under;">
    山田太郎
    <rt>やまだたろう</rt>
  </ruby>
  <rt>ヤマさん</rt>
</ruby>
```

　先述のHTMLと比べて`style`属性値の`over`と`under`が入れ替わっただけだ。

　両方にルビを振りつつ、連続した漢字を`｜`で分割するなら以下。

```
｜山田｜太郎《やまだ｜たろう｜ヤマさん》
```
```html
<ruby style="ruby-position:under;">
  <ruby style="ruby-position:over;">山田<rt>やまだ</rt></ruby>
  <ruby style="ruby-position:over;">太郎<rt>たろう</rt></ruby>
  <rt>ヤマさん</rt>
</ruby>
```

　両方にルビを振りつつ、最初のルビだけ一文字ずつルビを振るなら以下。

```
山田太郎《やま,だ,た,ろう｜ヤマさん》
```
```
｜山田太郎《やま,だ,た,ろう｜ヤマさん》
```
```
｜山田｜太郎《やま,だ｜た,ろう｜ヤマさん》
```
```html
<ruby style="ruby-position:under;">
  <ruby style="ruby-position:over;">山<rt>やま</rt></ruby>
  <ruby style="ruby-position:over;">田<rt>だ</rt></ruby>
  <ruby style="ruby-position:over;">太<rt>た</rt></ruby>
  <ruby style="ruby-position:over;">郎<rt>ろう</rt></ruby>
  <rt>ヤマさん</rt>
</ruby>
```

　両方にルビを振りつつ、両方とも連続した漢字に一文字ずつルビを振るなら以下。

```
｜山田太郎《やま,だ,た,ろう｜YAMA,DA,TA,ROU》
```
```html
<ruby style="ruby-position:under;">
  <ruby style="ruby-position:over;">山<rt>やま</rt></ruby>
  <rt>YAMA</rt>
</ruby>
<ruby style="ruby-position:under;">
  <ruby style="ruby-position:over;">田<rt>だ</rt></ruby>
  <rt>DA</rt>
</ruby>
<ruby style="ruby-position:under;">
  <ruby style="ruby-position:over;">太<rt>た</rt></ruby>
  <rt>TA</rt>
</ruby>
<ruby style="ruby-position:under;">
  <ruby style="ruby-position:over;">郎<rt>ろう</rt></ruby>
  <rt>ROU</rt>
</ruby>
```

　以上。これにて思い通りにルビを振れるでしょう。

### Em

```
《《強調》》
```
```html
<em>強調</em>
```
```css
text-emphasis: filled sesame red;
text-emphasis-style: sesame;
text-emphasis-color: red;
text-emphasis-position: auto;
```
```css
-webkit-text-emphasis: filled sesame red;
```

### エスケープ Ruby

　エスケープとは、HTML変換する簡易構文を変換せずそのまま出力することである。

　Short系をエスケープするには`|`（半角パイプ）を使う。

```
|漢字《かんじ》
```
```
漢字《かんじ》
```

　Long系をエスケープするには`||`（半角パイプ二連続）を使う。

```
||漢字《かんじ》
```
```
｜漢字《かんじ》
```

　`↓`をエスケープするには`￬￬`（半角下矢印二連続）を使う。

```
￬￬漢字《かんじ》
```
```
↓漢字《かんじ》
```

　これにて親文字やルビ文字に`｜`や`,`があってもそのまま出力される。

### エスケープ Em

　`《《》》`をエスケープするには`«»`を使う。

```
«強調»
```
```
《《強調》》
```

### HTML+CSS

　以下のCSSを適用すれば、HTMLの一部を省略できる。

```css
ruby.over { ruby-position:over; }
ruby.under { ruby-position:under; }
em {
  font-style: normal; /* 日本語圏の強調では斜体italicを使わず、傍点（圏点）を使うのが一般的である */
  -webkit-text-emphasis: filled sesame;
  text-emphasis: filled sesame;
}
em.en {font-style: italic;} /* 英語圏の強調では斜体italicが使われる */
```
```
｜山田太郎《やま,だ,た,ろう｜YAMA,DA,TA,ROU》
```
```html
<ruby class="under">
  <ruby class="over">山<rt>やま</rt></ruby>
  <rt>YAMA</rt>
</ruby>
<ruby class="under">
  <ruby class="over">田<rt>だ</rt></ruby>
  <rt>DA</rt>
</ruby>
<ruby class="under">
  <ruby class="over">太<rt>た</rt></ruby>
  <rt>TA</rt>
</ruby>
<ruby class="under">
  <ruby class="over">郎<rt>ろう</rt></ruby>
  <rt>ROU</rt>
</ruby>
```
```html
<ruby style="ruby-position:under;">
  <ruby style="ruby-position:over;">山<rt>やま</rt></ruby>
  <rt>YAMA</rt>
</ruby>
<ruby style="ruby-position:under;">
  <ruby style="ruby-position:over;">田<rt>だ</rt></ruby>
  <rt>DA</rt>
</ruby>
<ruby style="ruby-position:under;">
  <ruby style="ruby-position:over;">太<rt>た</rt></ruby>
  <rt>TA</rt>
</ruby>
<ruby style="ruby-position:under;">
  <ruby style="ruby-position:over;">郎<rt>ろう</rt></ruby>
  <rt>ROU</rt>
</ruby>
```

```
《《強調》》
```
```html
<em>強調</em>
```



