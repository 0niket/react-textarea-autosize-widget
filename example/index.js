"use strict";

requirejs.config({
  baseUrl: "../",
  paths: {
    widget: "build",
    libs: "libs"
  }
});

requirejs(["libs/react-with-addons", "widget/textareaAutosize"], function (React, TextareaAutosize) {
  React.render(React.createElement(TextareaAutosize, null), document.querySelector(".js-ta-autosize"));
});
