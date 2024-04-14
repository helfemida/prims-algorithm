let nodes = new vis.DataSet([]);
let edges = new vis.DataSet([]);
let network = null;
let priorityQueue = [];
let visited = new Set();
let container = document.getElementById('mst');
let pqContainer = document.getElementById('pq');

let options = {
    edges: {
        color: {inherit: true},
        arrows: {to: true}
    },
    physics: {
        enabled: false
    }
};

document.addEventListener('DOMContentLoaded', function () {
    network = new vis.Network(container, {nodes: nodes, edges: edges}, options);
});

function addEdge() {
    const fromNode = document.getElementById('node1').value.trim();
    const toNode = document.getElementById('node2').value.trim();
    const weight = document.getElementById('weight').value.trim();

    if (fromNode === "" || toNode === "" || weight === "" || isNaN(parseFloat(weight))) {
        alert("Please fill in all fields correctly (weight must be a number)");
        return;
    }

    if (!nodes.get(fromNode)) {
        nodes.add({id: fromNode, label: fromNode});
    }
    if (!nodes.get(toNode)) {
        nodes.add({id: toNode, label: toNode});
    }

    try {
        edges.add({
            from: fromNode,
            to: toNode,
            label: weight,
            id: fromNode + '-' + toNode,
            color: 'gray',
            arrows: 'to'
        });
    } catch (e) {
        alert("Edge already exists or there was an error in adding the edge: " + e);
    }
}

function startVisualization() {
    let startNodeID = document.getElementById('start-node').value.trim();
    if (!startNodeID || edges.length === 0) {
        alert("Please enter a start node and add some edges before starting the visualization.");
        return;
    }
    priorityQueue = [];
    visited.clear();
    visit(startNodeID);
    renderPriorityQueue();
}

function visit(nodeId) {
    visited.add(nodeId);
    let connectedEdges = edges.get({
        filter: function (edge) {
            return (edge.from === nodeId || edge.to === nodeId) && !(visited.has(edge.from) && visited.has(edge.to));
        }
    });
    connectedEdges.forEach(edge => {
        priorityQueue.push(edge);
        edges.update({id: edge.id, color: 'black'});
    });
    priorityQueue.sort((a, b) => parseFloat(a.label) - parseFloat(b.label));
}

function stepThrough() {
    if (priorityQueue.length === 0) {
        alert("No more edges to process.");
        return;
    }
    let edge = priorityQueue.shift();
    let nextNode = visited.has(edge.from) ? edge.to : edge.from;
    if (!visited.has(nextNode)) {
        visit(nextNode);
    }
    network.selectEdges([edge.id]);
    edges.update({id: edge.id, color: 'red'});
    renderPriorityQueue();
}

function renderPriorityQueue() {
    pqContainer.innerHTML = "Priority Queue:<br>";
    priorityQueue.forEach(edge => {
        pqContainer.innerHTML += `Edge: ${edge.from}-${edge.to} Weight: ${edge.label}<br>`;
    });
}

function resetGraph() {
    nodes.clear();
    edges.clear();
    visited.clear();
    priorityQueue = [];
    network.setData({nodes: new vis.DataSet(), edges: new vis.DataSet()});
    pqContainer.innerHTML = "Priority Queue:";
}

function removeConnection() {
    const fromNode = document.getElementById('node1').value.trim();
    const toNode = document.getElementById('node2').value.trim();
    const edgeId = fromNode + '-' + toNode;
    if (edges.remove({id: edgeId}).length === 0) {
        alert("No such edge exists.");
    }
}
