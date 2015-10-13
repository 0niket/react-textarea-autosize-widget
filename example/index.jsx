requirejs.config ({
  baseUrl: "../",
  paths: {
    widget: "build",
    libs: "libs"
  }
});

requirejs (
  ["libs/react-with-addons",
   "widget/textareaAutosize"],
  function  (React, TextareaAutosize) {
    React.render (<TextareaAutosize />, document.querySelector (".js-ta-autosize"));
  });
