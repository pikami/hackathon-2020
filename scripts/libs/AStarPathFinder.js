/**
 * A single map node. All nodes are assumed traversable and have the same cost.
 * Obstructions in the map are defined with a false value in the map data
 * and do not have a node instance.
 *
 * All nodes are created by the AStarPathFinder.loadMap() method and stored in the AStarPathFinder.nodes
 * and AStarPathFinder.nodesPosition arrays.
 *
 * @author Matthew Page <work@mjp.co>
 * @property {number} idx - The array index value (not used, but handy to have)
 * @property {number} x - The X position on the map
 * @property {number} y - The Y position on the map
 * @property {number} F - The F value of this node (g+h)
 * @property {number} g - The g Score of this node, cost of getting here from the start along the best path so far
 * @property {number} h - The h Score of this node, distance to the destination in a straight line
 * @property {AStarNode} parent - The node we came from on the best path so far
 * @property {boolean} isOpen - Is the node Open (in the open set), candidate to be looked at
 * @property {boolean} isClosed - Is the node Closed (in the closed set), finished with this node
 * @property {boolean} inPath - Is this node in the final path, only set once the path is found
 * @version 1.0
 */
class AStarNode {
	/**
	 * Create a new node instance and set basic properties.
	 *
	 * @param {number} x - The X position in the map
	 * @param {number} y - The Y position in the map
	 * @param {number} idx - Unique number / index in array
	 */
	constructor(x, y, idx) {
		this.idx = idx;  
		this.x = x;
		this.y = y;
		this.g = 0;
		this.h = 0;
		this.parent = false;
		this.isOpen = false;
		this.isClosed = false;
		this.inPath = false;
	}
	/**
	 * Set the node to Open (we may want to explore this node later)
	 */
	open() {
		this.isOpen = true;
		this.isClosed = false;
	}
	/**
	 * Set the node to Closed (we are done with this node)
	 */
	close() {
		this.isOpen = false;
		this.isClosed = true;
	}
	/**
	 * Get the F value (g + h)
	 */
	get F() {
		return Math.round(this.g + this.h);	
	}
	/**
	 * Get the distance to the supplied node, calculated as a straight 
	 * line between the points using Pythagoras
	 *
	 * @param {Node} dest - The destination node
	 * @returns {number} - Distance bewtween the two nodes
	 */
	distanceTo(dest) {
		let x = Math.abs(this.x - dest.x);
		let y = Math.abs(this.y - dest.y);
		let d = Math.sqrt((x*x)+(y*y));
		return d;
	}
}
/**
 * An A* path finder. This class implements the A* path finding algorithm. It is not optimised for efficiency
 * but is designed for ease of reading and use.
 *
 * @author Matthew Page <work@mjp.co>
 * @example
 * const myStar = new AStarPathFinder();
 * myStar.loadMap(myMapArray);
 * myStar.setStart(0,0);
 * myStar.setDestination(9,9);
 * let myPath = myStar.findPath();
 *
 * @property {number} width - Width of the map
 * @property {number} height - Height of the map
 * @property {AStarNode[]} nodes - Array of traversable map nodes
 * @property {AStarNode[]} nodesPosition - Lookup array of map positions [y][x]
 * @property {Object} start - The starting position in a simple x, y wrapper
 * @property {Object} destination - The destination position in a simple x, y wrapper
 * @property {number} wg - g weight, the g value will be multiplied by this, tweak the algorithm to your needs
 * @property {number} wh - h weight, the h value will be multiplied by this, tweak the algorithm to your needs
 * @property {AStarNode[]} path - The final path if one is found, array of nodes from start to destination
 * @version 1.0
 *
 */
class AStarPathFinder {
	/**
	 * Make a new path finder, you'll need to load a map and
	 * set the start and destination points, but this is a good start :)
	 *
	 * @param {number} width - Width of the map (how many nodes across)
	 * @param {number} height - Height of the map (how many nodes down)
	 */
	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.nodes = [];
		this.nodesPosition = [];
		this.start = false;
		this.destination = false;
		/* Default weights for g and h - tweak these to get more accurate or efficient results */
		this.wg = 10;
		this.wh = 30;
	}
	/**
	 * Main path finding loop - call this to get a path back. This is the main logic of the 
	 * A* algorithm. 
	 *
	 * @param {number} maxLoops - Maximum number of loops we can take, useful for debug and stopping on complex maps
	 * @returns {array} Array of path nodes from start to destination or empty if no path found
	 */
	findPath(maxLoops) {
				
		/* We can restrict how many loops we'll make */
		this.maxLoops = maxLoops;
		this.loopCount = 0;
		
		/* The final path */
		let path = [];
		
		/* Get the start and destination node out of the position lookup array */
		let startNode = this.nodesPosition[this.start.y][this.start.x];
		let destNode = this.nodesPosition[this.destination.y][this.destination.x];
		
		/* Setup the start node - add to the open set */
		startNode.open();
		
		/* Set h to distance to destination * h weight */
		startNode.h = this.wh * startNode.distanceTo(destNode);
		
		/* Set g to 0, no cost to get here, we started here */
		startNode.g = 0;
		
		/* Set the node we are exploring */
		let currentNode = startNode;

		/* Into the main loop - do this until there are no more open nodes or the destination is found or maxLoops reached */
		do {
			/* Get this nodes neighbours - 8 possible neighbours, only Open or Unexplored nodes returned */
			let neighbours = this.neighboursOf(currentNode);
			
			/* Each of the neighbours */
			neighbours.forEach((neighbour)=>{
				
				/* Is the neighbour node already open */
				if(neighbour.isOpen) {
					
					/* Can the neighbour's g value be improved by coming from this current node ? */
					if(neighbour.g > (currentNode.g + ( currentNode.distanceTo(neighbour)*this.wg ))) {
						
						/* Yes this is a better path to the neighbour. Set neighbour g to the current node g + distance from current node */
						neighbour.g = currentNode.g + ( currentNode.distanceTo(neighbour)*this.wg );
						
						/* Parent node of neighbour is changed to the current node */
						neighbour.parent = currentNode;
					}
				} else {
					
					/* Neighbour node not open, it's unexplored so add to open list */
					neighbour.open();
					
					/* Set neighbour h to distance to destination * h weight */
					neighbour.h = neighbour.distanceTo(destNode)*this.wh;
					
					/* Set neighbour g to the current node g + distance from current node * g weight */
					neighbour.g = currentNode.g + ( neighbour.distanceTo(currentNode)*this.wg ); 
					
					/* Parent of neighbour is set to the current node */
					neighbour.parent = currentNode;
				}
				
			});
			
			/* Close the current node, we're done with it and have new open candidates to look at */
			currentNode.close();

			/* Get a new current node, search in the nodes array for the lowest F value open node */
			currentNode = this.lowestFOpenNode();
			
			/* Have we reached the destination */
			if(currentNode == destNode) {
				/**
				 * Yes, reached the destination - WoooHoooo
				 * Make the path by pushing the nodes from destination to start, until we 
				 * reach the start node which does not have a parent 
				 */
				while(currentNode.parent) {
					
					/* Push the node on to the path */
					path.push(currentNode);
					
					/* Tell the node it is in the path */
					currentNode.inPath = true;
					
					/* New current node = parent of current node */
					currentNode = currentNode.parent;
				}
				
				/* Push the final node which is the start node with no parent */
				path.push(currentNode);
				currentNode.inPath = true;
				
				/* Return the path array - we exit the routine here when we have found a path [EXIT] */
				return path;
			}

			/* Keep count of how many loops we do */
			this.loopCount += 1;
			
		/* Keep going until currentNode is false (no more nodes to explore) or we exceed the maxLoops restriction */	
		} while (currentNode && this.loopCount < this.maxLoops);

		/* We exit the routine here if no path could be found or maxLoops exceeded, path will be empty array [EXIT] */
		return path;
	}
	/**
	 * Get the open node with the lowest F value, if multiple
	 * nodes have same F the lowest h value is chosen.
	 *
	 * @returns {Node} Single open node with lowest F value out of all open nodes
	 */
	lowestFOpenNode() {
		let lowestFNode = false;
		
		/* Each of the nodes in all nodes - bad for efficiency */
		this.nodes.forEach((node)=>{

			/* Only check open nodes */
			if(node.isOpen) {				
				if(!lowestFNode) {
					
					/* Lowest node hasn't been set yet - set to this node */
					lowestFNode = node;
					
				} else if(node.F < lowestFNode.F) {
					
					/* This node F is lower than lowest F Node - set to this node */
					lowestFNode = node;
					
				} else if(node.F == lowestFNode.F) {	
					
					/* Have the same F value, compare the h value, pick one closer to the destination. Fiddle with this.. */
					if(node.h <= lowestFNode.h) {						
						lowestFNode = node;
					}
				}
			}
		});
		return(lowestFNode);
	}
	/**
	 * Load the map from the array[y][x] supplied. Populates the nodes and nodesPosition array
	 * with new AStarNode instances or false values.
	 * Map format : True = traversable, False = wall or obstacle
	 * Origin : Top Left is at 0,0
	 *
	 * @param {array} map - The map array
	 */
	loadMap(map) {
		this.nodes = [];
		this.nodesPosition = [];

		/* Each of the map positions - work through the map Y then X to help with managing arrays */
		for(let y = 0; y < this.height; y++) {
			
			/* Have to create each array in our multi dim array */
			this.nodesPosition[y] = [];
			for(let x = 0; x < this.width; x++) {
			
				/* Check the map to see if True or False at position X , Y */
				if(map[y][x]) {
				
					/* Push a new node to the array, reference the node in the nodesPosition lookup */
					this.nodes.push(new AStarNode(x, y, this.nodes.length));
					this.nodesPosition[y][x] = this.nodes[this.nodes.length-1];
				} else {
					
					/* No node here, put false in the position map */
					this.nodesPosition[y][x] = false;
				}
			}
		}
		return true;
	}
	/**
	 * Set the start position on the map
	 *
	 * @param {number} x - The map X position
	 * @param {number} y - The map Y position
	 */
	setStart(x, y) {
		this.start = { x: x, y: y };
	}
	/**
	 * Set the destination position on the map
	 *
	 * @param {number} x - The map X position
	 * @param {number} y - The map Y position
	 */
	setDestination(x, y) {
		this.destination = { x: x, y: y };
	}
	/**
	 * Get the neighbours of the parent node, Open or Unexplored nodes that surround
	 * this node in a 3x3 grid. X and Y loop from -1 to 1, this is added to the node.x and node.y
	 * to give the neighbour location.
	 *
	 * @param {Node} node - The starting node
	 * @returns {AStarNode[]} - Array of open or unexplored neighbour nodes
	 */
	neighboursOf(node) {
		let neighbours = [];
		let neighbour = false;
		for(let x = -1; x <= 1; x++) {
			for(let y = -1; y <= 1; y++) {
				
				/* Temporary container for the x, y - easy reading */
				neighbour = {x: node.x+x, y: node.y+y};
				
				/* Is this neighbour in the map, or outside the map area */
				if(neighbour.x >=0 && neighbour.y >=0 && neighbour.x < this.width && neighbour.y < this.height) {
					
					/* Ignore center node, it's the one we are dealing with */
					if(!(x==0 && y==0)) {
						
						/* Is there a traversable node at neighbours position */
						if(this.nodesPosition[neighbour.y][neighbour.x]) {
							
							/* Is the node not closed (it's open or unexplored)*/
							if(!this.nodesPosition[neighbour.y][neighbour.x].isClosed) {
								
								/* Push the node onto the neighbours array to be returned when we're done */
								neighbours.push(this.nodesPosition[neighbour.y][neighbour.x]);
							}
						}
					}
				}
			}
		}
		return neighbours;
	}
}

module.exports = {AStarPathFinder};