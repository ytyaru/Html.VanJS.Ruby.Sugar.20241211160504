# `<wbr>`

　[`<wbr>`][]要素を使いたいことがあるかもしれない。これは自動改行する位置を指定する。

```html
ひとつの文章でも<wbr>
区切りのいい所で<wbr>
分割してほしい。<wbr>
ただし自動折返しする必要がない場合は<wbr>
一行で表示してほしい。<wbr>
```

　このメタ文字を決めたい。

## メタ文字

　行末に`\`があるとき`<wbr>`に変換する。

```
ひとつの文章でも\
区切りのいい所で\
分割してほしい。\
ただし自動折返しする必要がない場合は\
一行で表示してほしい。\
```

[`<wbr>`]:https://developer.mozilla.org/ja/docs/Web/HTML/Element/wbr

# 問題

　`<wbr>`だとプレーンテキストを対象にした場合しか効かない。`<ruby>`などのHTML要素が含まれてしまうと機能しない。

## 解決案: `display:inline-block;`

* [それでも私が<wbr>でなくinline-blockで改行調整をする、たった1つの理由][]

[それでも私が<wbr>でなくinline-blockで改行調整をする、たった1つの理由]:https://zenn.dev/kagan/articles/css-control-break

```css
p span.wbr {display:inline-block;}
```
```html
<p>
<span class="wbr">ああああああああああああああ</span>
<span class="wbr">いいいいいいいいいいいいいい</span>
<span class="wbr">うううううううううううううう</span>
</p>
```

## 問題: スクリーンリーダー読み上げ

　読み上げに問題が生じる。`display:inline-block;`で区切ると、一つの文章として判断してくれなくなるようだ。

　一つの表記によって以下二つを最適に明記したい。

* 表示
* 読み上げ

表記
```
<ruby>親文字<rt>おやもじ</rt></ruby>を<wbr>読み上げる。
```

表示
```
おやもじ
親文字　を
読み上げる。
```

読み上げ
```
おやもじをよみあげる。
```

　`<wbr>`は他のHTML要素があるとき無効になる。あくまでプレーンテキストのみ有効。

### 解決案：[ゼロ幅スペース][]

[ゼロ幅スペース]:https://ja.wikipedia.org/wiki/%E3%82%BC%E3%83%AD%E5%B9%85%E3%82%B9%E3%83%9A%E3%83%BC%E3%82%B9

　Unicodeでは、ゼロ幅スペースはU+200B zero width space (HTML: &#8203;)に割り当てられている。

### 問題：テキスト検索できなくなる

　ゼロ幅スペースが挿入されているため、それを間に挟んだテキストは検索できなくなる。

```
<pre></pre>
```

# まとめ

[CSSで文節の折り返しを！br・wbrとauto-phraseの活用術]:https://ics.media/entry/241105/


1. `<br class="sp-only">`
2. `<wbr>`
3. `display:inline-block;`
4. `word-break:auto-phrase;`
5. [BudouX][]

[BudouX]:https://github.com/google/budoux

```css
/* モバイル幅では改行を無効化 */
@media (640px < width) {
  .only-mobile {
    display: none;
  }
}
```
```html
吾輩は猫である。名前はまだ無い。<br class="only-mobile" />
どこで生れたかとんと見当がつかぬ。<br />
何でも薄暗いじめじめした所で<br class="only-mobile" />
ニャーニャー泣いていた事だけは記憶している。<br  />
吾輩はここで始めて人間というものを見た。
```
```html
<p class="example">ジョバンニは、<wbr />口笛を吹いているような<wbr />さびしい口付きで、<wbr />･･･（省略）</p>
```
```css
span.wbr { display: inline-block; }
```
```html
<p>
  <span class="wbr">ジョバンニは、</span><span class="wbr">口笛を吹いているような</span>
  <span class="wbr">さびしい口付きで、</span>（…省略）
  <span class="wbr">まわって</span><span class="wbr">来るのでした。</span>
</p>
```
