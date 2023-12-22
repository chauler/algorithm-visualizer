"use strict";

import { PathfindingCookies } from "./Cookies.js";
/*
* Contains classes and functions used in the canvas of the
* pathfinding page. DOMElement handling and interactions,
* data structures and helper functions for the algorithms, etc.
*/

/*
Holds the TD elements displayed in the canvas.
*/
class Table {
    constructor() {
        this.elementTable = []
        this.cellSize = PathfindingCookies.GetCellSize()
        this.graph = new Graph()
    }

    //generates a table based on the specs of the page
    CreateTable() {
        //Clear existing table data
        this.elementTable = []
        this.graph = new Graph()

        //Calculate new table dimensions
        let { divisions: columns, cellSize: width } = DivideArea(window.innerWidth, this.cellSize)
        let { divisions: rows, cellSize: height } = DivideArea(window.innerHeight, this.cellSize)

        for(let y=0; y<rows; y++) {
            //Create new row
            this.elementTable.push([])
            for(let x=0; x<columns; x++) {
                //Create a new cell for the DOM
                let node = document.createElement("td")
                node.id = (`${y},${x}`)
                node.style.setProperty("--width", width)
                node.style.setProperty("--height", height)

                //Create a new vertex for the graph
                const vertex = new Vertex(x, y, {walkable: true, start: false, end: false})

                //Add these to the canvas
                const pair = new ElementVertexPair(node, vertex)
                pair.addPair(this.elementTable, this.graph)
            }
        }
        this.DisplayTable()
    }

    //Modify the current elementTable when changes are made to the page
    UpdateTable() {
        let { divisions: newColumns, cellSize: width } = DivideArea(window.innerWidth, this.cellSize)
        let { divisions: newRows, cellSize: height } = DivideArea(window.innerHeight, this.cellSize)

        //Adjust rows to match change in page dimensions
        //Remove excess rows
        for(let rowDiff = newRows - this.elementTable.length; rowDiff < 0; rowDiff++) {
            for(const pair of this.elementTable[this.elementTable.length-1]) {
                this.graph.removeVertex(pair.vertex)
            }
            this.elementTable.pop()
        }
        //Add new rows
        for(let rowDiff = newRows - this.elementTable.length; rowDiff > 0; rowDiff--) {
            //Create a new row to be filled with default nodes
            this.elementTable.push([])

            //Create new pairs and fill the new row
            for(let x=0; x<this.elementTable[0].length; x++) {
                let node = document.createElement("td")
                node.id = (`${this.elementTable.length-1},${x}`)
                node.style.setProperty("--width", width)
                node.style.setProperty("--height", height)
                const vertex = new Vertex(node)
                const pair = new ElementVertexPair(node, vertex)
                pair.addPair(this.elementTable, this.graph)
            }
        }
        //Remove excess columns
        for(let columnDiff = newColumns - this.elementTable[0].length; columnDiff < 0; columnDiff++) {
            //Pop 1 element off each row
            for(let row of this.elementTable) {
                this.graph.removeVertex(row[row.length-1].vertex)
                row.pop()
            }
        }
        //Add new columns
        for(let y=0; y < this.elementTable.length; y++) {
            //Iterate through each row, add 1 element each time
            let row = this.elementTable[y]
            for(let columnDiff = newColumns - row.length; columnDiff > 0; columnDiff--) {
                let node = document.createElement("td")
                node.id = (`${y},${row.length}`)
                node.style.setProperty("--width", width)
                node.style.setProperty("--height", height)
                const vertex = new Vertex(node)
                const pair = new ElementVertexPair(node, vertex)
                pair.addPair(this.elementTable, this.graph)
            }
        }
        this.DisplayTable()
    }

    //Takes in a graph and makes it this Table's elementTable, displaying it
    NewTable(graph) {
        this.elementTable = []
        let columns = Math.max(...graph.vertices.map((element)=>{return element.x})) + 1
        let rows = Math.max(...graph.vertices.map((element)=>{return element.y})) + 1

        let width = window.innerWidth / columns
        let height = window.innerHeight / rows

        graph.vertices.sort((a, b)=>{return a.y - b.y || a.x - b.x})
        for(let y=0; y<rows; y++) {
            this.elementTable.push([])
            for(let x=0; x<columns; x++) {
                let node = document.createElement("td")
                node.id = `${y},${x}`
                node.style.setProperty("--width", width)
                node.style.setProperty("--height", height)
                graph.vertices[y*columns+x].walkable ? 0 : node.className="wall"
                graph.vertices[y*columns+x].start ? node.className="startnode" : 0
                graph.vertices[y*columns+x].end ? node.className="endnode" : 0
                //this.elementTable[y].push(node)
                this.elementTable[y].push(new ElementVertexPair(node, new Vertex(node)))
            }
        }
        this.DisplayTable()
    }

    DisplayTable() {
        //Clear existing table
        let displayArea = document.querySelector("#grid-container")
        displayArea.innerHTML = ""
        //Set new table dimensions
        displayArea.style.setProperty("--columns", this.elementTable[0].length);
        displayArea.style.setProperty("--rows", this.elementTable.length);

        //Populate page with data held in elementTable
        for(let y=0; y<this.elementTable.length; y++) {
            for(let x=0; x<this.elementTable[y].length; x++) {
                displayArea.appendChild(this.elementTable[y][x].DOMElement)
            }
        }
    }
    //Grabs a Element from the elementTable, modifies it, and updates the DOM
    EditNode(y, x, func) {
        let node = this.elementTable[y][x]
        func(node)
    }

    UpdateCellSize() {
        this.cellSize = PathfindingCookies.GetCellSize()
    }

    ClearDOMStyles() {
        for(const row of this.elementTable) {
            for(const pair of row) {
                pair.DOMElement.style = ""
            }
        }
    }

}

class Graph {
    constructor(table) {
        this.adjList = new Map()
        this.vertices = []

        //Make graph from an HTML table if provided
        if(table instanceof Element) {
            other = ParseTable(table)
            this.adjList = other.adjList
            this.vertices = other.vertices
        }
    }

    get start() {
        return this.vertices.find((element)=>{return element.start})
    }

    get end() {
        return this.vertices.find((element)=>{return element.end})
    }

    addVertex(vertex) {
        this.vertices.push(vertex)
        this.adjList.set(vertex, [])
    }

    removeVertex(vertex) {
        let neighbors = this.adjList.get(vertex)
        
        //Remove references to the given vertex from the entries of each of its neighbors
        for(const neighbor of neighbors) {
            let arr = this.adjList.get(neighbor)
            arr.splice(arr.indexOf(vertex), 1)
        }

        //Remove the vertex's entry
        this.adjList.delete(vertex)
        this.vertices.splice(this.vertices.indexOf(vertex), 1)
    }

    addEdge(a, b) {
        this.adjList.get(a).push(b)
        this.adjList.get(b).push(a)
    }

    deleteEdge(a, b) {
        const array1 = this.adjList.get(a)
        const array2 = this.adjList.get(b)
        array1.remove(array1.indexOf(b))
        array2.remove(array2.indexOf(a))
    }

    //Take a DOM element table and return a graph object
    static ParseTable(table) {
        const graph = new Graph()

        //Parse each cell in the table individually
        table.childNodes.forEach(cell => {
                if(cell.nodeName !== "TD"){
                    return
                }
                //Populate vertex with data from table
                const coords = cell.id.split(",").map((coord)=>{return Number(coord)})
                let isWalkable = cell.className !== "wall"
                let vertex = new Vertex(coords[1], coords[0], {walkable: isWalkable, start: cell.className=="startnode", end: cell.className=="endnode"})
                
                //Add the new node and whatever new edges the node may have
                graph.addVertex(vertex)
                for(const key of graph.adjList.keys()) {
                    if (((key.x == vertex.x+1 || key.x == vertex.x-1) && key.y == vertex.y) || (key.x == vertex.x && (key.y == vertex.y+1 || key.y == vertex.y-1))) {
                        graph.addEdge(key, vertex)
                    }
                }
            })
        return graph
    }

    //Takes in a graph and returns the graph with walls separating all nodes
    static PartitionGraph(canvas) {
        //DFS Maze generation assumes walls between all nodes. Because our walls are nodes themselves (rather than walls between nodes), 
        //we need to modify the table to place walls on every other node to separate the ones we will be making the maze with.

        //New map to track the empty nodes that will be used in maze generation
        canvas.graph.emptyNeighbors = new Map()

        for(let row of canvas.elementTable) {
            row.forEach((pair)=>{
                let vertex = pair.vertex
                //Make every other node empty, all others walls
                if(vertex.x%2==0 && vertex.y%2==0) {
                    pair.vertexWalkable = true
                    //We need to track the empty nodes and their own adjacency lists.
                    canvas.graph.emptyNeighbors.set(vertex, [])
                    for(const key of canvas.graph.emptyNeighbors.keys()) {
                        if((Math.abs(vertex.x-key.x)==2 && vertex.y==key.y) || (Math.abs(vertex.y-key.y)==2 && vertex.x==key.x)) {
                            canvas.graph.emptyNeighbors.get(vertex).push(key)
                            canvas.graph.emptyNeighbors.get(key).push(vertex)
                        }
                    }
                } else {
                    pair.vertexWalkable = false
                }
            })
        }
    }
}

class Vertex {
    constructor(x, y, options) {
        if(x instanceof Element) {
            const coords = x.id.split(",").map((coord)=>{return Number(coord)})
            let isWalkable = x.className !== "wall"
            this.x = coords[1]
            this.y = coords[0]
            this.walkable = isWalkable
            this.start = x.className === "startnode"
            this.end = x.className === "endnode"
            this.f = 999999999
            this.g = 999999999
            this.h = 0
            return
        }
        this.x = x
        this.y = y
        this.f = 999999999
        this.g = 999999999
        this.h = 0
        this.walkable = options?.walkable ?? true
        this.start = options?.start || false
        this.end = options?.end || false
    }
}

function CellHandler(event) {
    event.preventDefault()
    const dragFunc = cellDrag.bind(this)
    const cleanupFunc = cleanUp.bind(this)
    document.addEventListener(event.type == "mousedown" ? "mousemove" : "touchmove", dragFunc)
    document.addEventListener(event.type == "mousedown" ? "mouseup" : "touchend", cleanupFunc)

    let drag = false
    const origin = [event.touches?.[0].clientX || event.clientX, event.touches?.[0].clientY || event.clientY] //Original click coordinates. Compared against to determine if mouse is dragging

    //Called upon movement after clicking
    function cellDrag(e) {
        //Dragging requires different handling, so check for that first. Otherwise, default to mouse inputs
        const x = e.touches?.[0].clientX || e.clientX
        const y = e.touches?.[0].clientY || e.clientY
        const element = document.elementFromPoint(x, y)
        //Because we use elementFromPoint, we may get non-table elements. Ignore those
        if(element?.tagName !== "TD") {
            return
        }
        const distance = Math.abs(x - origin[0]) + Math.abs(y - origin[1])
        if(distance < this.cellSize/2 && !drag) {
            return
        }
        drag = true
        const coords = element.id.split(",").map(coord => Number(coord))
        this.elementTable[coords[0]][coords[1]].elementClass = "wall"
    }
    function cleanUp(e) {
        document.removeEventListener(e.type == "mouseup" ? "mousemove" : "touchmove", dragFunc)
        document.removeEventListener(e.type == "mouseup" ? "mouseup" : "touchend", cleanupFunc)

        const x = e.clientX
        const y = e.clientY
        const element = document.elementFromPoint(x, y)
        if(element?.tagName !== "TD") {
            return
        }
        let coords = element.id.split(",").map(coord => Number(coord))

        //If input ended without dragging:
        if(!drag) {
            if(element.className === "startnode") {
                this.elementTable[coords[0]][coords[1]].elementClass = "endnode"
            }
            else if(element.className === "endnode" || element.className === "wall") {
                this.elementTable[coords[0]][coords[1]].elementClass = ""
            }
            else {
                this.elementTable[coords[0]][coords[1]].elementClass = "startnode"
            }
        }
        drag = false;
    }
}

function DFSMaze(canvas) {
    const graph = canvas.graph
    const walkableNodes = Array.from(graph.emptyNeighbors.keys())
    const visited = new Array(walkableNodes.length).fill(false) //Parallel array to the vertices made to track what's been visited
    const stack = []
    let cell = walkableNodes[Math.floor(Math.random() * walkableNodes.length)] //Initialize to a random starting point
    visited[walkableNodes.indexOf(cell)] = true //Mark cell as visited
    stack.push(cell)

    while(stack.length > 0) {
        //Pop a cell and make it current cell
        cell = stack.pop()
        //If current cell has unvisited neighbors,
        let unvisited = []
        for(let neighbor of graph.emptyNeighbors.get(cell)) {
            if(!visited[walkableNodes.indexOf(neighbor)]) {
                unvisited.push(neighbor)
            }
        }
        if(unvisited.length==0) {
            continue
        }
        //Push current cell to stack
        stack.push(cell)
        //Choose one of unvisited neighbors
        let neighbor = unvisited[Math.floor(Math.random() * unvisited.length)]
        //Remove the wall between the two
        canvas.elementTable[(cell.y + neighbor.y) / 2][(cell.x + neighbor.x) / 2].vertexWalkable = true
        //Mark chosen neighbor as visited and push to stack
        visited[walkableNodes.indexOf(neighbor)] = true
        stack.push(neighbor)
    }
}

class PlayBar {
    constructor() {
        this.startButton = document.querySelector("#generate")
        this.cancelButton = document.querySelector('#cancel')
        this.resetButton = document.querySelector("#reset")
        this.playButton = document.querySelector("#PlayPause")
        this.progressBar = document.querySelector("#Progress-Bar")
    }
}

class ElementVertexPair {
    constructor(element, vertex) {
        this.DOMElement = element
        this.vertex = vertex
    }

    get elementClass() {
        return this.DOMElement.className
    }
    
    set elementClass(value) {
        this.DOMElement.className = value
        
        if(value === "wall") {
            this.vertex.walkable = false
            this.vertex.start = false
            this.vertex.end = false
        } else if(value === "startnode") {
            this.vertex.start = true
            this.vertex.walkable = true
            this.vertex.end = false
        } else if(value === "endnode") {
            this.vertex.end = true
            this.vertex.start = false
            this.vertex.walkable = true
        } else if(value === "") {
            this.vertex.walkable = true
            this.vertex.start = false
            this.vertex.end = false
        }
    }

    get vertexWalkable() {
        return this.vertex.walkable
    }
    
    set vertexWalkable(value) {
        this.vertex.walkable = value

        //If walkable, remove wall from classlist. Else add wall
        if(value) {
            this.DOMElement.classList.remove("wall")
        }
        else {
            this.DOMElement.classList.add("wall")
            this.DOMElement.classList.remove("startnode")
            this.DOMElement.classList.remove("endnode")
        }
    }

    addPair(table, graph) {
        //Update the DOM
        table[this.vertex.y][this.vertex.x] = this

        //Update the graph backing the DOM
        graph.addVertex(this.vertex)
        for(const key of graph.adjList.keys()) {
            if (((key.x == this.vertex.x+1 || key.x == this.vertex.x-1) && key.y == this.vertex.y) || (key.x == this.vertex.x && (key.y == this.vertex.y+1 || key.y == this.vertex.y-1))) {
                graph.addEdge(key, this.vertex)
            }
        }
    }
}

function DivideArea(areaSize, cellSize) {
    let divisions = Math.floor(areaSize / cellSize)
    if(divisions < 1) {
        divisions = 1
    }


    cellSize = areaSize / divisions

    return { divisions, cellSize }
}

export { Table, Graph, DFSMaze, CellHandler }