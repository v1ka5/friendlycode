(function() {
  module("Help");

  function helpAt(index, searchString, html) {
    return index.get(html.indexOf(searchString));
  }
  
  function assertHighlightIntervals(index, searchString, strings, html) {
    var highlights = helpAt(index, searchString, html).highlights;
    var prefix = "in " + JSON.stringify(html) + ", when cursor is at " +
                 JSON.stringify(searchString) + ", ";
    equal(highlights.length, strings.length,
          prefix + "there are " + strings.length + " highlight(s)");
    for (var i = 0; i < highlights.length; i++)
      equal(html.slice(highlights[i].start, highlights[i].end), strings[i],
            prefix + "highlight interval " + i + " is " +
            JSON.stringify(strings[i]));
  }

  function buildIndex(html) {
    var index = Help.Index();
    var doc = Slowparse.HTML(document, html).document;

    index.build(doc, html);
    return index;
  }
  
  test("Index.clear() works", function() {
    var index = buildIndex('<p>hi</p>');
    ok(index.get(0));
    index.clear();
    equal(index.get(0), undefined);
  });
  
  test("Index.get() returns undefined when in text node", function() {
    equal(buildIndex('<em>hi</em>').get(4), undefined);
  });
  
  test("Index.get() returns help for HTML elements", function() {
    var html = '<p>he<br>llo</p>';
    var index = buildIndex(html);
    var help = helpAt(index, "<p>", html);
    
    ok(help.html.match(/paragraph/i),
       "Index contains HTML help from hacktionary");
    equal(help.url, Help.MDN_URLS.html + 'p',
          "Index contains MDN URL for HTML elements");
    assertHighlightIntervals(index, "<p>", ["<p>", "</p>"], html);
    assertHighlightIntervals(index, "<br>", ["<br>"], html);
  });
  
  test("Index.get() returns help for CSS properties", function() {
    var html = '<style>body { color: blue; }</style>';
    var index = buildIndex(html);
    var help = helpAt(index, "color", html);
    
    ok(help.html.match(/foreground/i),
       "Index contains CSS property help from hacktionary");
    equal(help.url, Help.MDN_URLS.css + "color",
          "Index contains MDN URL for CSS properties");
    assertHighlightIntervals(index, "color", ["color"], html);
  });

  test("Index.get() returns help for CSS selectors", function() {
    var html = '<style>body { color: blue; }</style>';
    var index = buildIndex(html);
    var help = helpAt(index, "body", html);

    ok(help.html.match(/selector/i),
       "Index contains CSS selector help from hacktionary");
    ok(help.url, Help.MDN_URLS.cssSelectors,
       "Index contains MDN URL for CSS selectors");
    assertHighlightIntervals(buildIndex(html), "body", ["body"], html);
  });
})();
