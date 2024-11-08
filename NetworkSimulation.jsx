import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
class Node {
  constructor(id) {
    this.id = id;
    this.distances = {};
    this.neighbors = new Set();
  }
}
class Network {
  constructor() {
    this.nodes = {};
  }
  addNode(id) {
    this.nodes[id] = new Node(id);
  }
  addLink(id1, id2, cost) {
    if (!this.nodes[id1] || !this.nodes[id2]) return;
    // Ensure bidirectional consistency
    this.nodes[id1].distances[id2] = cost;
    this.nodes[id2].distances[id1] = cost;
    this.nodes[id1].neighbors.add(id2);
    this.nodes[id2].neighbors.add(id1);
  }
  poisonRoute(fromNode, toNode) {
    if (!this.nodes[fromNode] || !this.nodes[toNode]) return;
    // Poison both directions
    this.nodes[fromNode].distances[toNode] = 16;
    this.nodes[toNode].distances[fromNode] = 16;
  }
}
const NetworkSimulation = () => {
  const [network, setNetwork] = useState(new Network());
  const [routingType, setRoutingType] = useState("distance-vector");
  const [routingTables, setRoutingTables] = useState({});
  const [iteration, setIteration] = useState(0);
  const [poisonedRoute, setPoisonedRoute] = useState(null);
  // Initialize network with bidirectional links
  useEffect(() => {
    const newNetwork = new Network();
    ["A", "B", "C", "D"].forEach((id) => newNetwork.addNode(id));
    newNetwork.addLink("A", "B", 1);
    newNetwork.addLink("B", "C", 1);
    newNetwork.addLink("C", "D", 1);
    newNetwork.addLink("A", "D", 4); // This automatically sets D to A as 4 as well
    setNetwork(newNetwork);
  }, []);
  const simulateDistanceVector = () => {
    const newTables = {};
    Object.keys(network.nodes).forEach((nodeId) => {
      newTables[nodeId] = { ...network.nodes[nodeId].distances };
    });
    for (let i = 0; i < Object.keys(network.nodes).length - 1; i++) {
      Object.keys(network.nodes).forEach((nodeId) => {
        network.nodes[nodeId].neighbors.forEach((neighbor) => {
          Object.keys(newTables[neighbor]).forEach((dest) => {
            if (dest !== nodeId) {
              const newDist =
                network.nodes[nodeId].distances[neighbor] +
                newTables[neighbor][dest];
              if (
                !newTables[nodeId][dest] ||
                newDist < newTables[nodeId][dest]
              ) {
                newTables[nodeId][dest] = newDist;
              }
            }
          });
        });
      });
    }
    setRoutingTables(newTables);
    setIteration((prev) => prev + 1);
  };
  const simulateLinkState = () => {
    const newTables = {};
    Object.keys(network.nodes).forEach((startNode) => {
      const distances = {};
      const visited = new Set();
      Object.keys(network.nodes).forEach((node) => {
        distances[node] = Infinity;
      });
      distances[startNode] = 0;
      while (visited.size < Object.keys(network.nodes).length) {
        let minNode = null;
        let minDist = Infinity;
        Object.keys(distances).forEach((node) => {
          if (!visited.has(node) && distances[node] < minDist) {
            minNode = node;
            minDist = distances[node];
          }
        });
        if (minNode === null) break;
        visited.add(minNode);
        network.nodes[minNode].neighbors.forEach((neighbor) => {
          const alt =
            distances[minNode] + network.nodes[minNode].distances[neighbor];
          if (alt < distances[neighbor]) {
            distances[neighbor] = alt;
          }
        });
      }
      newTables[startNode] = distances;
    });
    setRoutingTables(newTables);
    setIteration((prev) => prev + 1);
  };
  const poisonRoute = () => {
    if (!poisonedRoute) return;
    const [from, to] = poisonedRoute.split("-");
    network.poisonRoute(from, to);
    setIteration((prev) => prev + 1);
  };
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Network Routing Simulation</h2>
      <div className="flex gap-4 mb-4">
        <Select value={routingType} onValueChange={setRoutingType}>
          <SelectTrigger>
            <SelectValue placeholder="Select routing type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="distance-vector">Distance Vector</SelectItem>
            <SelectItem value="link-state">Link State</SelectItem>
          </SelectContent>
        </Select>
        <Select value={poisonedRoute || ""} onValueChange={setPoisonedRoute}>
          <SelectTrigger>
            <SelectValue placeholder="Select route to poison" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A-B">A to B</SelectItem>
            <SelectItem value="B-C">B to C</SelectItem>
            <SelectItem value="C-D">C to D</SelectItem>
            <SelectItem value="A-D">A to D</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={poisonRoute}>Poison Route</Button>
        <Button
          onClick={
            routingType === "distance-vector"
              ? simulateDistanceVector
              : simulateLinkState
          }
        >
          Simulate Iteration
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Object.keys(network.nodes).map((nodeId) => (
          <Card key={nodeId}>
            <CardHeader>Node {nodeId} Routing Table</CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Destination</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(routingTables[nodeId] || {}).map(
                    ([dest, cost]) => (
                      <tr key={dest}>
                        <td>{dest}</td>
                        <td>{cost}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ))}
      </div>
      {poisonedRoute && (
        <div className="mt-4 flex items-center text-yellow-500">
          <AlertCircle className="mr-2" />
          Route {poisonedRoute} has been poisoned in both directions!
        </div>
      )}
    </div>
  );
};
export default NetworkSimulation;
