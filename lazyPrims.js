let nodes = new vis.DataSet([]);
let edges = new vis.DataSet([]);
let network = null;
let priorityQueue = [];
let visited = new Set();
let container = document.getElementById('mst');
let data = { nodes: nodes, edges: edges }; 
let pqContainer = document.getElementById('pq');
let unvisitedColor = "#00FF00"; 
let currentColor = "#FFFF00"; 
let visitedColor = "#FF0000"; 
let mstColor = "#FF4500"; 
let defaultEdgeColor = "#808080"; 
let delay = 4000;
let delayIncrement = 0;

let options = {
  edges: {
    color: { color: defaultEdgeColor }
  },
  nodes: {
    chosen: false 
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
            color: {color: defaultEdgeColor, highlight: '#ff0000'}, 
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
        alert("choose or enter the start node please!");
        return;
    }
    
    visited.clear();
    priorityQueue = [];

    let startNode = nodes.get()[startNodeID];

    if (startNode) {
        visit(startNodeID);
        completeMST();
        renderPriorityQueue();
    }
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
}

function completeMST() {
    let mstEdges = [];
    while (priorityQueue.length > 0) {
        let edge = priorityQueue.shift(); 
        let nextNode = visited.has(edge.from) ? edge.to : edge.from;
        console.log("pq top: " + edge.to + "-" + edge.from + "len: " + edge.length)

        if (visited.has(edge.to)){
            nodes.update({id: edge.to, color: 'yellow'})
            console.log("cycle!")
            pqContainer.innerHTML = "Cycle between " + edge.from + " " + edge.to;
        }

        if (!visited.has(edge.from) || !visited.has(edge.to)) {
            edges.update({id: edge.id, color: {color: mstColor, highlight: mstColor}, chosen: true});

            nodes.update({id: edge.from, color: visitedColor});

            visited.add(nextNode);
            nodes.update({id: nextNode, color: currentColor});
    
            setTimeout(() => {
                visit(nextNode);
                completeMST();
            }, 6000);

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
    pqContainer.innerHTML = "Priority Queue:";
}

function resetGraph() {
    nodes.clear();
    edges.clear();
    visited.clear();
    priorityQueue = [];
    if (network !== null) {
        network.setData({nodes: nodes, edges: edges});
    }
    document.getElementById('node1').value = '';
    document.getElementById('node2').value = '';
    document.getElementById('weight').value = '';

    network.setData({nodes: new vis.DataSet(), edges: new vis.DataSet()});
    pqContainer.innerHTML = "Priority Queue:";
}

function renderPriorityQueue() {
    pqContainer.innerHTML = "Priority Queue:<br>";
    priorityQueue.forEach(edge => {
        pqContainer.innerHTML += `Edge: ${edge.from}-${edge.to} Weight: ${parseFloat(edge.length)}<br>`;
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
