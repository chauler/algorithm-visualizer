import { FinalPath, SearchedPath, NewChildren, SkippedNode, JumpNode } from "../../PathfindingAnimations.js"
import Timeline from "../../Timeline.js"

function JPS(graph, start, end) {
    const open = []
    const closed = []
    const timeline = Timeline()

    open.push(start)
    start.g = 0
    start.f = 0

    while (open.length != 0) {
        open.sort((a, b) => {
            if(a.f-b.f !== 0) {
                return a.f-b.f
            }
            else {
                return a.g >= b.g ? -1 : 1
            }}) //Sort ascending by cost

        let current = open.shift()
        closed.push(current)

        if (current === end) {//If the current node is the end node
            const jumpArr = []
            //Follow the line of parent nodes until undefined, this
            //gives the jumps in the final path, not the full path
            while(current) {
                jumpArr.push(current)
                current = current.parent
            }
            //Expand the list of jumps to a full path
            const expanded = ExpandPath(jumpArr)
            //Convert path of vertices to DOMElements, animate
            expanded.forEach((node, index)=>{expanded[index]=document.getElementById(`${node.y},${node.x}`)})
            FinalPath.AddToTimeline(timeline, {
                target: expanded.reverse(),
                highlight: {target: document.querySelector("#pseudo1")},
            })
            return timeline
        }

        FindSuccessors(current)
    }
    //Only executed upon failure to find end
    return undefined

    function FindSuccessors(node) {
        const neighbors = FindNeighbors(node)
        for(let i=0, l=neighbors.length; i < l; i++) {
            let neighbor = neighbors[i]
            //Label is used to position the jump node animation before the skipped nodes to more accurately illustrate
            //the order of action in the code: while the skipped nodes are "discovered" first, nothing is done upon discovering them, just further recursion.
            const timelinePreJumpPos = timeline.addLabel("PreJump")
            let jumpPoint = _jump(neighbor, node)
            if(jumpPoint) {
                const element = document.getElementById(`${jumpPoint.y},${jumpPoint.x}`)
                JumpNode.AddToTimeline(timeline, {
                    target: element, label:"PreJump",
                    highlight: {target: document.querySelector("#pseudo3")},
                })
                timeline.removeLabel("PreJump")

                let jx = jumpPoint.x
                let jy = jumpPoint.y
                if(typeof closed.find(element=>element==jumpPoint) !== "undefined") {
                    continue
                }
    
                let d = Math.abs(jx - node.x) + Math.abs(jy - node.y)
                let ng = node.g + d

                if(!open.find(element=>element==jumpPoint) || ng < jumpPoint.g) {
                    jumpPoint.g = ng
                    jumpPoint.h = jumpPoint.h || Math.abs(jx - end.x) + Math.abs(jy - end.y)
                    jumpPoint.f = jumpPoint.g + jumpPoint.h
                    jumpPoint.parent = node

                    if(!open.find(element=>element==jumpPoint)) {
                        open.push(jumpPoint)
                    }
                    else {
                        continue
                    }
                }
            }
        }
    }
    
    function FindNeighbors(node) {
        let dx, dy
        const allNeighbors = graph.adjList.get(node)
        const neighborsToSearch = []
        //If node was traveled to from a parent, prune neighbors based on direction
        if(node.parent) {
            let px = node.parent.x
            let py = node.parent.y
            dx = (node.x - px) / Math.max(Math.abs(node.x - px), 1)
            dy = (node.y - py) / Math.max(Math.abs(node.y - py), 1)
    
            if(dx !== 0) {
                if(allNeighbors.find(element=>element.x==node.x && element.y==node.y-1)) {
                    neighborsToSearch.push(allNeighbors.find(element=>element.x==node.x && element.y==node.y-1))
                }
                if(allNeighbors.find(element=>element.x==node.x && element.y==node.y+1)) {
                    neighborsToSearch.push(allNeighbors.find(element=>element.x==node.x && element.y==node.y+1))
                }
                if(allNeighbors.find(element=>element.x==node.x+dx && element.y==node.y)) {
                    neighborsToSearch.push(allNeighbors.find(element=>element.x==node.x+dx && element.y==node.y))
                }
            }
            else if(dy !== 0) {
                if(allNeighbors.find(element=>element.y==node.y && element.x==node.x-1)) {
                    neighborsToSearch.push(allNeighbors.find(element=>element.y==node.y && element.x==node.x-1))
                }
                if(allNeighbors.find(element=>element.y==node.y && element.x==node.x+1)) {
                    neighborsToSearch.push(allNeighbors.find(element=>element.y==node.y && element.x==node.x+1))
                }
                if(allNeighbors.find(element=>element.y==node.y+dy && element.x==node.x)) {
                    neighborsToSearch.push(allNeighbors.find(element=>element.y==node.y+dy && element.x==node.x))
                }
            }
        }
        else {
            for(let neighbor of allNeighbors) {
                neighborsToSearch.push(neighbor)
            }
        }
        return neighborsToSearch
    }

    function _jump(node, parent) {
        if(!node?.walkable) {
            return null
        }
        let dx = node.x-parent.x
        let dy = node.y-parent.y
        const neighbors = graph.adjList.get(node)
        if(node.end) {
            return node
        }
        if(dx !== 0) {
            //Essentially checks if the pathfinder is at a corner with tiles to be checked on the other side. If so, make this a jump point
            if((neighbors.find(element=>element.x==node.x && element.y==node.y-1)?.walkable && !graph.vertices.find(element=>element.x==node.x-dx && element.y==node.y-1)?.walkable)
            ||
            (neighbors.find(element=>element.x==node.x && element.y==node.y+1)?.walkable && !graph.vertices.find(element=>element.x==node.x-dx && element.y==node.y+1)?.walkable)) {
                return node
            }
        }
        else if(dy !== 0) {
            //Essentially checks if the pathfinder is at a corner with tiles to be checked on the other side. If so, make this a jump point
            if((neighbors.find(element=>element.x==node.x-1 && element.y==node.y)?.walkable && !graph.vertices.find(element=>element.x==node.x-1 && element.y==node.y-dy)?.walkable)
            ||
            (neighbors.find(element=>element.x==node.x+1 && element.y==node.y)?.walkable && !graph.vertices.find(element=>element.x==node.x+1 && element.y==node.y-dy)?.walkable)) {
                return node
            }
            //Find jump points horizontally when moving vertically
            if(_jump(neighbors.find(element=>element.x==node.x+1 && element.y==node.y), node) || _jump(neighbors.find(element=>element.x==node.x-1 && element.y==node.y), node)) {
                return node
            }
        }
        else {
            throw new Error("Only cardinal directions allowed")
        }
        const element = document.getElementById(`${node.y},${node.x}`)
        //element.style.backgroundColor = "#808080F0"
        SkippedNode.AddToTimeline(timeline, {
            target: element,
            highlight: {target: document.querySelector("#pseudo2")},
        })
        //If not a point of interest, continue jumping in the same direction
        return _jump(neighbors.find(element=>element.x==node.x+dx && element.y==node.y+dy), node)
    }

    function ExpandPath(path) {
        const expanded = []

        for(let i=0; i<path.length-1; i++) {
            let node1 = path[i]
            let node2 = path[i+1]

            const interpolated = interpolate(node1, node2)
            for(let j=0; j<interpolated.length; j++) {
                expanded.push(interpolated[j])
            }
        }
        return expanded
    }

    function interpolate(node1, node2) {
        let x0 = node1.x, x1 = node2.x, y0 = node1.y, y1 = node2.y
        var abs = Math.abs,
            line = [],
            sx, sy, dx, dy, err, e2;
    
        dx = abs(x1 - x0);
        dy = abs(y1 - y0);
    
        sx = (x0 < x1) ? 1 : -1;
        sy = (y0 < y1) ? 1 : -1;
    
        err = dx - dy;
    
        while (true) {
            line.push(graph.vertices.find(element=>element.x==x0 && element.y==y0));
    
            if (x0 === x1 && y0 === y1) {
                break;
            }
            
            e2 = 2 * err;
            if (e2 > -dy) {
                err = err - dy;
                x0 = x0 + sx;
            }
            if (e2 < dx) {
                err = err + dx;
                y0 = y0 + sy;
            }
        }
    
        return line;
    }
}
export { JPS }