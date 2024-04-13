let nodes = new vis.DataSet([]);
let edges = new vis.DataSet([]);
let network = null;
let priorityQueue = [];
let visited = new Set();
let container = document.getElementById('mst');
let data = { nodes: nodes, edges: edges }; // Display all edges initially in black
let options = {
  edges: {
    color: { inherit: false }
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
        nodes.add({id: fromNode, label: 'Node ' + fromNode});
    }
    if (!nodes.get(toNode)) {
        nodes.add({id: toNode, label: 'Node ' + toNode});
    }

    try {
        edges.add({
            from: fromNode, 
            to: toNode, 
            label: weight, 
            id: fromNode + '-' + toNode, 
            color: {color: '#848484', highlight: '#ff0000'}, 
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
    visited.clear();
    priorityQueue = [];
    let startNode = nodes.get()[0];
    if (startNode) {
        visit(startNode.id);
        completeMST();
    }
}

function visit(nodeId) {
    visited.add(nodeId);
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
    priorityQueue.sort((a, b) => a.length - b.length); // Min-heap simulation by sorting
}

function completeMST() {
    while (priorityQueue.length > 0) {
        let edge = priorityQueue.shift(); // Get the edge with the minimum weight
        if (!visited.has(edge.from) || !visited.has(edge.to)) {
            edges.update({id: edge.id, color: {color: 'red', highlight: 'red'}, chosen: true});
            let nextNode = visited.has(edge.from) ? edge.to : edge.from;
            visit(nextNode);
        }
    }
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
}
