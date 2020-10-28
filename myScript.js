/* global model, Ext */
/*************** CONFIGURABLE CONSTANTS *******************/
const START_TEXT = "START";
const END_TEXT = "END";
const START_COLOR = "green";
const END_COLOR = "red";
const OPTION_COLOR = "blanchedalmond";
const CONDITION_COLOR = "darkgray";
const APPROVED_TEXT = "Approved";
const REJECTED_TEXT = "Rejected";
const BLOCKSIZE = 100, BLOCKGAP = 30;
/*************** CONFIGURABLE CONSTANTS *******************/
/*************** DO NOT CAHNGE THESE *******************/
const RECT_LEFT = 3, RECT_RIGHT = 4, RECT_TOP = 1, RECT_BOTTOM = 6;
const DIAMOND_LEFT = 3, DIAMOND_RIGHT = 4, DIAMOND_TOP = 1, DIAMOND_BOTTOM = 6;
const CIRCLE_TOP = 2, CIRCLE_BOTTOM = 10;
const ANCHORS_RECTANGLE = model.defaultAnchors("Rectangle");
const ANCHORS_DIAMOND = model.defaultAnchors("Diamond");
const ANCHORS_CIRCLE = model.defaultAnchors("Circle");
/*************** DO NOT CAHNGE THESE *******************/
/*********************** Functions to add flowchart elements ***************************/
function addParentLink(nod) {
    if (!nod.isRoot()) {
        if (model.nodes[nod.data.nodIdx].figure === "Diamond") {
            model.addLink(new model.link(nod.data.nodIdx, currNodeIndex, DIAMOND_RIGHT, DIAMOND_TOP, APPROVED_TEXT));
        } else if (model.nodes[nod.data.nodIdx].figure === "Circle") {
            model.addLink(new model.link(nod.data.nodIdx, currNodeIndex, CIRCLE_BOTTOM, CIRCLE_TOP, ""));
        } else {
            model.addLink(new model.link(nod.data.nodIdx, currNodeIndex, RECT_BOTTOM, RECT_TOP, ""));
        }
    } else {
        model.addLink(new model.link(0, currNodeIndex, CIRCLE_BOTTOM, RECT_TOP, ""));
    }
}
function AddStart() {
    model.addNode(new model.node(200, 0, BLOCKSIZE, BLOCKSIZE, ANCHORS_CIRCLE, START_TEXT, START_COLOR, "Circle"));
}
function AddEnd(thisObj) {
    currpos += BLOCKSIZE + BLOCKGAP;
    model.addNode(new model.node(200, currpos, BLOCKSIZE, BLOCKSIZE, ANCHORS_CIRCLE, END_TEXT, END_COLOR, "Circle"));
    currNodeIndex++;
    thisObj.each(function (rec) {
        if (rec.data.leaf) {
            if (rec.data.lastNodIdx !== currNodeIndex) {
                if (model.nodes[rec.data.lastNodIdx].figure === "Diamond") {
                    model.addLink(new model.link(rec.data.lastNodIdx, currNodeIndex, DIAMOND_RIGHT, CIRCLE_TOP, APPROVED_TEXT));
                } else if (model.nodes[rec.data.lastNodIdx].figure === "Circle") {
                    model.addLink(new model.link(rec.data.lastNodIdx, currNodeIndex, CIRCLE_BOTTOM, CIRCLE_TOP, ""));
                } else {
                    model.addLink(new model.link(rec.data.lastNodIdx, currNodeIndex, RECT_BOTTOM, CIRCLE_TOP, ""));
                }
            }
        }
    });
}
function addOption(el, nod) {
    model.addNode(new model.node(el.data.positionX, el.data.positionY,
            BLOCKSIZE, BLOCKSIZE, ANCHORS_RECTANGLE, el.data.text,
            OPTION_COLOR, "Rectangle"));
    currNodeIndex++;
    addParentLink(nod);
    el.data.lastNodIdx = currNodeIndex;
}
function addOptionCheck(el, nod) {
    addOption(el, nod);
    currpos += BLOCKSIZE + BLOCKGAP;
    model.addNode(new model.node(el.data.positionX, el.data.positionY + (BLOCKSIZE + BLOCKGAP),
            BLOCKSIZE, BLOCKSIZE, ANCHORS_DIAMOND, el.data.text + " Check",
            CONDITION_COLOR, "Diamond"));
    currNodeIndex++;
    el.data.lastNodIdx = currNodeIndex;
    model.addLink(new model.link(currNodeIndex - 1, currNodeIndex, RECT_BOTTOM, DIAMOND_TOP, ""));
    model.addLink(new model.link(currNodeIndex, currNodeIndex - 1, DIAMOND_LEFT, RECT_LEFT, REJECTED_TEXT));
}
function addOptionApprove(el, nod) {
    addOptionCheck(el, nod);
    currpos += BLOCKSIZE + BLOCKGAP;
    model.addNode(new model.node(el.data.positionX, el.data.positionY + (BLOCKSIZE + BLOCKGAP) + (BLOCKSIZE + BLOCKGAP),
            BLOCKSIZE, BLOCKSIZE, ANCHORS_DIAMOND, el.data.text + " Approval",
            CONDITION_COLOR, "Diamond"));
    currNodeIndex++;
    model.addLink(new model.link(currNodeIndex - 1, currNodeIndex, DIAMOND_RIGHT, DIAMOND_TOP, APPROVED_TEXT));
    model.addLink(new model.link(currNodeIndex, currNodeIndex - 2, DIAMOND_LEFT, RECT_LEFT, REJECTED_TEXT));
    el.data.lastNodIdx = currNodeIndex;
}
/*********************** Functions to add flowchart elements ***************************/
var img = new Image();
var currpos = 0, currNodeIndex = 0;
var Figures = {
    Rectangle: function (ctx, node) {
        ctx.beginPath();
        ctx.fillStyle = node.fillStyle;
        ctx.strokeStyle = "black";
        ctx.fillRect(node.x, node.y, node.w, node.h);
        ctx.fillStyle = "black";
        ctx.font = "20px Verdana";
        ctx.textBaseline = "top";
        node.textfill(ctx);
    },
    Circle: function (ctx, node) {
        ctx.beginPath();
        ctx.fillStyle = node.fillStyle;
        ctx.ellipse(node.x + node.w / 2, node.y + node.h / 2, node.w / 2, node.h / 2, 0, 0, 2 * Math.PI);
        ctx.fill();
        node.textfill(ctx);
    },
    Diamond: function (ctx, node) {
        ctx.beginPath();
        ctx.fillStyle = node.fillStyle;
        ctx.moveTo(node.x, node.y + node.h / 2);
        ctx.lineTo(node.x + node.w / 2, node.y);
        ctx.lineTo(node.x + node.w, node.y + node.h / 2);
        ctx.lineTo(node.x + node.w / 2, node.y + node.h);
        ctx.fill();
        node.textfill(ctx);
    }
};

function setCanvasHeight() {
    document.getElementById('myCanvas').height = model.nodes[model.nodes.length - 1].y + 100;
    console.log(document.getElementById('myCanvas').height);
}
function drawFlowChartTree(nod) {
    currpos += BLOCKSIZE + BLOCKGAP;
    nod.isRoot() ? nod.data.positionX = 200 : "";
    nod.isRoot() ? nod.data.positionY = currpos : nod.data.positionY = currpos;
    nod.isRoot() ? nod.data.nodIdx = 0 : nod.data.nodIdx = model.nodes.length - 1;
    var i = 1;
    nod.eachChild(function (el) {
        el.data.nodIdx = nod.data.nodIdx + i;
        i++;
        el.data.positionX = nod.data.positionX;
        el.data.positionY = nod.data.positionY;
        if (el.data.approve) {
            addOptionApprove(el, nod);
        } else if (el.data.check) {
            addOptionCheck(el, nod);
        } else {
            addOption(el, nod);
        }
        nod.data.positionX += BLOCKSIZE + BLOCKGAP;

        if (el.childNodes.length > 0) {
            drawFlowChartTree(el);
        }
    });
}
function ResetFlowChart() {
    model.clean();
    model.nodes = [];
    model.links = [];
    currpos = 0;
    currNodeIndex = 0;
}
var drawFlowChart = function () {
    var thisObj = Ext.StoreManager.lookup('StudentData');
    if (thisObj) {
        var nod = thisObj.getRootNode();
        ResetFlowChart();
        AddStart();
        drawFlowChartTree(nod);
        AddEnd(thisObj);
        model.init("myCanvas");
        setCanvasHeight();
        model.draw();
    }
};
model.init("myCanvas");
model.draw();
img.onload = (() => model.draw());
img.src = "web.svg";