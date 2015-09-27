/**
 * Textarea autosize widget
 * @author Aniket Hendre <hendre.ani@gmail.com>
 * @created Sep 27, 2015
 * @module textareaAutosize
 */

define ("textareaAutosize", function () {
  "use strict";


  var PureRenderMixin = React.addons.PureRenderMixin;

  return React.createClass ({

    displayName: "TextareaAutosize",

    mixins: [PureRenderMixin],

    propTypes: {
      // Minimum height of textarea is derived from minRows
      minRows: React.PropTypes.number,

      // Maximum height of textarea is derived from maxRows
      maxRows: React.PropTypes.number,

      // Get initial value of component
      value: React.PropTypes.string,

      // If component is uncontrolled
      defaultValue: React.PropTypes.string,

      // Function to execute on onChange event
      onChange: React.PropTypes.func,

      // Function to execute on height change
      onHeightChange: React.PropTypes.func,

      style: React.PropTypes.object
    },

    getDefaultProps: function () {
      return {
        minRows : 1,
        maxRows : Infinity
      };
    },

    getInitialState: function () {
      return {
        height    : null,
        overflowY : "auto"
      };
    },

    render: function () {
      var taProps = {}, key;

      // Clone all props
      for (key in this.props) {
        if (this.props.hasOwnProperty (key)) {
          taProps [key] = this.props [key];
        }
      }

      // Delete from props
      delete taProps.minRows;
      delete taProps.maxRows;
      delete taProps.onChange;
      delete taProps.onHeightChange;

      if (this.state.height !== null) {
        // Set changed height
        taProps.style = taProps.style || {};
        taProps.style.height = this.state.height;
        taProps.style.overflowY = this.state.overflowY;
      } else {
        // used for initial rendering
        taProps.rows = this.props.minRows;
      }

      return (
        <textarea {...taProps}
                  onChange={this._handleChange}
                  ref="ta" />
      );
    },

    _minHt: null, // Derived from minRows.
    _maxHt: null, // Derived from maxRows.
    _prevOffsetHeight: null,

    /**
     * on change event execute resize and also execute specified onChange event.
     */
    _handleChange: function (ev) {
      if (this.props.onChange) {
        this.props.onChange (ev);
      }

      // Call autoresize only if component is uncontrolled.
      if (typeof this.props.value === "undefined") {
        this._autoResize ();
      }
    },


    /**
     * Change height of textarea depending on content size.
     */
    _autoResize: function () {
      var node = React.findDOMNode (this.refs.ta);
      var clientHt = node.clientHeight;
      var scrollHt = node.scrollHeight;
      var height, overflowY;

      if (scrollHt <= this._maxHt) {
        // if scroll height is less than max height then scroll should be disabled.
        overflowY = "hidden";
        if (scrollHt > this._minHt && scrollHt <= clientHt) {
          // if scroll height is less than client height but greater than minimum height
          // then decrease height
          this._updateNodeStyle (0, overflowY, function () {
            scrollHt = node.scrollHeight;
            height = scrollHt > this._minHt ? scrollHt : this._minHt;
            this._updateNodeStyle (height, overflowY);
          }.bind (this));
        } else if (scrollHt > clientHt) {
          // if scroll height is greater than client height then increase the client height.
          height = scrollHt;
          this._updateNodeStyle (height, overflowY);
        }
      } else {
        // if scroll height is greater than max height then textarea should have scroll.
        // and set textarea's height to max height.
        height = this._maxHt;
        overflowY = "scroll";
        this._updateNodeStyle (height, overflowY);
      }
    },

    /**
     * Update height & overflow-y of node. And if present call callback.
     */
    _updateNodeStyle: function (height, overflowY, callback) {
      this.setState ({
        height: height,
        overflowY: overflowY
      }, callback);
    },

    /**
     * call autoresize only if component is controlled and value is changed.
     */
    componentDidUpdate: function(prevProps) {
      var node = React.findDOMNode (this.refs.ta);
      if (typeof this.props.value !== "undefined" && this.props.value !== prevProps.value) {
        this._autoResize ();
      }

      /**
       * Since in autosize we are changing height to zero which changes offset height
       * to be less than minimum height. We need to check whether prevOffsetHeight &
       * current offsetHeight are greater than minimum height. And if prevOffsetHeight
       * is different from current offsetHeight.
       */
      if (this._prevOffsetHeight >= this._minHt && node.offsetHeight >= this._minHt) {
        if (this._prevOffsetHeight !== node.offsetHeight && this.props.onHeightChange) {
          this.props.onHeightChange ();
        }
        this._prevOffsetHeight = node.offsetHeight;
      }
    },

    componentDidMount: function () {
      var rowHt, node, padding, computedStyle;

      // Find dom node by reference.
      node = React.findDOMNode (this.refs.ta);

      // Get padding of textarea element.
      computedStyle = window.getComputedStyle (node, null);
      padding = parseFloat (computedStyle.getPropertyValue ("padding-top"));
      padding += parseFloat (computedStyle.getPropertyValue ("padding-bottom"));

      // row height is client height minus top & bottom padding divided by min rows.
      rowHt = ((node.clientHeight - padding) / this.props.minRows);

      // minimum height of textarea is offsetHeight of textarea element.
      this._minHt = node.offsetHeight;

      // maximum height of textarea is height of single row into given maxRows + padding.
      this._maxHt = (rowHt * this.props.maxRows) + padding;

      // Initial value of textarea is greater than min rows.
      if (node.scrollHeight > node.clientHeight) {
        this._autoResize ();
      }

      // Get initial client height. This is used to call onHeightChange event.
      this._prevOffsetHeight = node.offsetHeight;
    }
  });
});
