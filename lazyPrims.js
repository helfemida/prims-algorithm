let nodes = new vis.DataSet([]);
let edges = new vis.DataSet([]);
let network = null;
let priorityQueue = [];
let visited = new Set();
let container = document.getElementById('mst');
let data = { nodes: nodes, edges: edges }; 
let pqContainer = document.getElementById('pq');

let unvisitedColor = "#840434"; //default color
let currentColor = "#f79902";  //yellow/orange
let visitedColor = "#007533"; //green
let mstColor = "#bd0449"; 
let defaultEdgeColor = "#808080";  //gray

let delay = 3000;

let options = {
  edges: {
    color: { color: defaultEdgeColor },
    width: 2
  },
  nodes: {
    chosen: false,
    font: {
        color: "white",
    },
    background: unvisitedColor,
    shape: "circle",
  }
};

function initializeGraph() {
    network = new vis.Network(container, data, options);
}

document.addEventListener('DOMContentLoaded', initializeGraph);

function addEdge() {
    const fromNode = document.getElementById('node1').value.trim();
    const toNode = document.getElementById('node2').value.trim();
    const weight = document.getElementById('weight').value.trim();

    if (fromNode === "" || toNode === "" || weight === "" || isNaN(parseFloat(weight))) {
        alert("Please fill in all fields correctly (weight must be a number)");
        return;
    }

    if (!nodes.get(fromNode)) {
        nodes.add(
            {id: fromNode, 
            label: fromNode,
            color: unvisitedColor});
    }
    if (!nodes.get(toNode)) {
        nodes.add(
            {id: toNode, 
                label: toNode,
                color: unvisitedColor});
    }

    try {
        edges.add({
            from: fromNode, 
            to: toNode, 
            label: weight, 
            id: fromNode + '-' + toNode, 
            color: {color: defaultEdgeColor, highlight: defaultEdgeColor}, 
            chosen: false
        });
        if (network === null) {
            initializeGraph();
        }
    } catch (e) {
        alert("Edge already exists or there was an error in adding the edge: " + e);
    }
}

function startVisualization() {
    if (edges.length === 0) {
        alert("Please add some edges before starting the visualization.");
        return;
    }
    const startNodeID = document.getElementById('start-node').value.trim();
    if(startNodeID === ""){
        alert("Choose or enter the start node please!");
        return;
    }
    visited.clear();
    priorityQueue = [];
    renderPriorityQueue();
    nodes.update({id: startNodeID, color: currentColor});
    visit(startNodeID);
    completeMST();
}

function visit(nodeId) {
    visited.add(nodeId);
    nodes.update({id: nodeId, color: currentColor});

    console.log("Node " + nodeId + " is now visiting");

    edges.get({
        filter: function (edge) {
            return (edge.from === nodeId || edge.to === nodeId) && 
                   !(visited.has(edge.from) && visited.has(edge.to));
        }
    }).forEach(edge => {
        priorityQueue.push({
            id: edge.id,
            from: edge.from,
            to: edge.to,
            length: parseFloat(edge.label)
        });
    });

    priorityQueue.sort((a, b) => a.length - b.length); 
    nodes.update({id: nodeId, color: visitedColor});
    renderPriorityQueue();
}

function completeMST() {
    renderPriorityQueue();
    let mstEdges = [];
    while (priorityQueue.length > 0) {
        let edge = priorityQueue.shift(); 
        let nextNode = visited.has(edge.from) ? edge.to : edge.from;

        if (!visited.has(edge.from) || !visited.has(edge.to)) {
            edges.update({id: edge.id, color: {color: mstColor, highlight: mstColor}, chosen: true});

            nodes.update({id: edge.from, color: visitedColor});

            visited.add(nextNode);
            nodes.update({id: nextNode, color: currentColor});
    
            setTimeout(() => {
                nodes.update({id: nextNode, color: currentColor});
                visit(nextNode);
                completeMST();
            }, delay);

            edges.update({id: edge.id, color: {color: visitedColor, highlight: visitedColor}, chosen: true});
            return;
        } else {
            mstEdges.push(edge.id);
        }
    }

    nodes.forEach(node => {
        nodes.update({id: node.id, color: unvisitedColor});
    });
    alert("MST is ready!")
    pqContainer.innerHTML = "We reached V-1 nodes"
}

function resetMST(){
    edges.forEach(edge => {
        edges.update({id: edge.id, color: {color: unvisitedColor, highlight: unvisitedColor}, chosen: false});
    });
    visited.clear();
    priorityQueue = [];
    document.getElementById('node1').value = '';
    document.getElementById('node2').value = '';
    document.getElementById('weight').value = '';
    document.getElementById('start-node').value = '';
}

function resetGraph() {
    updateWebpage();

    document.getElementById('node1').value = '';
    document.getElementById('node2').value = '';
    document.getElementById('weight').value = '';
    document.getElementById('start-node').value = '';

    visited.clear();
    priorityQueue = [];
}

function updateWebpage() {
    container = document.getElementById('mst');
    pqContainer = document.getElementById('pq');

    nodes.clear();
    edges.clear();

    network = new vis.Network(container, data, options);
}


function renderPriorityQueue() {
    pqContainer.innerHTML = '';
    priorityQueue.forEach(edge => {
        pqContainer.innerHTML += `Edge: ${edge.from}-${edge.to} | Weight: ${parseFloat(edge.length)}<br>`;
    });
}

function removeConnection() {
    const fromNode = document.getElementById('node1').value.trim();
    const toNode = document.getElementById('node2').value.trim();
    const edgeId = fromNode + '-' + toNode;
    if (edges.remove({id: edgeId}).length === 0) {
        alert("No such edge exists.");
    }
}
