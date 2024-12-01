// import dynamic from 'next/dynamic'
// import { useQuery,gql } from '@apollo/client';
// import { useState } from 'react';

// // const mostRecentQuery = gql`
// // query {
// //   articles(limit: 5, sort:{created:DESC}) {
// //     __typename
// //     id
// //     url
// //     title
// //     score
// //     created
// //   }
// // }
// // `

// const getAllTransactionsQuery = gql`
// query {
//   transaction(hash: "691a7e28f76b88001c0a59b06bdd5759271e4e86d9cfb9cef338ce9c4cc3d0bd") {
//     hash
//     vin {
//       address
//     }
//     vout {
//       address
//     }
//   }
// }
// `;




// const NoSSRForceGraph = dynamic(() => import('./lib/NoSSRForceGraph'), {ssr: false})

// // const myData = {
// //   nodes: [
// //     { id: '1', label: 'Node 1' },
// //     { id: '2', label: 'Node 2' },
// //     { id: '3', label: 'Node 3' },
// //   ],
// //   links: [
// //     { source: '1', target: '2' },
// //     { source: '1', target: '3' },
// //   ]
// // }

// // const formatData = (data) => {
// //   const nodes = [];
// //   const links = [];

// //   // Check if transactions exist in the data
// //   if (!data.transactions) {
// //     return { nodes, links };
// //   }

// //   data.transactions.forEach((t) => {
// //     // Add a node for the transaction
// //     nodes.push({
// //       id: t.id,
// //       amount: t.amount,
// //       timestamp: t.timestamp,
// //       chainId: t.chainId,
// //       type: "Transaction", // Helps differentiate between Wallets and Transactions
// //     });

// //     // Add nodes for the 'from' and 'to' wallets if they don't already exist
// //     if (!nodes.find((node) => node.id === t.from.address)) {
// //       nodes.push({
// //         id: t.from.address,
// //         chainId: t.from.chainId,
// //         type: "Wallet",
// //       });
// //     }

// //     if (!nodes.find((node) => node.id === t.to.address)) {
// //       nodes.push({
// //         id: t.to.address,
// //         chainId: t.to.chainId,
// //         type: "Wallet",
// //       });
// //     }

// //     // Add links for the relationships
// //     links.push({
// //       source: t.from.address,
// //       target: t.id,
// //       type: "SENT_FROM",
// //     });

// //     links.push({
// //       source: t.id,
// //       target: t.to.address,
// //       type: "SENT_TO",
// //     });

// //     // Add links for suspicious patterns, if any
// //     if (t.suspiciousPatterns) {
// //       t.suspiciousPatterns.forEach((pattern) => {
// //         links.push({
// //           source: t.id,
// //           target: pattern.name,
// //           type: "PART_OF_PATTERN",
// //         });

// //         // Add pattern as a node if it doesn't exist
// //         if (!nodes.find((node) => node.id === pattern.name)) {
// //           nodes.push({
// //             id: pattern.name,
// //             type: "Pattern",
// //             description: pattern.description,
// //           });
// //         }
// //       });
// //     }

// //     // Add links for events, if any
// //     if (t.events) {
// //       t.events.forEach((event) => {
// //         links.push({
// //           source: t.id,
// //           target: event.id,
// //           type: "TRIGGERED_IN",
// //         });

// //         // Add event as a node if it doesn't exist
// //         if (!nodes.find((node) => node.id === event.id)) {
// //           nodes.push({
// //             id: event.id,
// //             name: event.name,
// //             details: event.details,
// //             chainId: event.chainId,
// //             type: "Event",
// //           });
// //         }
// //       });
// //     }

// //     // Add link for bridgedTo, if exists
// //     if (t.bridgedTo) {
// //       links.push({
// //         source: t.id,
// //         target: t.bridgedTo.address,
// //         type: "BRIDGED_TO",
// //       });

// //       // Add bridged wallet as a node if it doesn't exist
// //       if (!nodes.find((node) => node.id === t.bridgedTo.address)) {
// //         nodes.push({
// //           id: t.bridgedTo.address,
// //           chainId: t.bridgedTo.chainId,
// //           type: "Wallet",
// //         });
// //       }
// //     }
// //   });

// //   return { nodes, links };
// // };

// const formatData = (data) =>{
//   const nodes = [];
//   const links =[];

//   if(!data.centralizedExchanges)
//     {
//       return {nodes,links}
//     }
//   data.centralizedExchanges.forEach( (a)=> {
//     nodes.push({
//       id: a.name,
//     })

//     nodes.push({
//       id: "myExchange"
//     })

//     links.push({
//       source:a.name,
//       target:"myExchange"
//     })
    
//   });

//   return {nodes,links}
// }


// export default function Home() {
//   const [graphData, setGraphData] = useState({nodes:[], links:[]})
//   const {data} = useQuery(getAllTransactionsQuery, {
//     onCompleted: (data) => setGraphData(formatData(data))
//   })
//   return (
//     <>
//     <NoSSRForceGraph graphData={graphData}/>
//     </>
//   )
// }


import dynamic from "next/dynamic";
import { useQuery, gql } from "@apollo/client";
import { useState } from "react";
import "tailwindcss/tailwind.css";

const NoSSRForceGraph = dynamic(() => import("./lib/NoSSRForceGraph"), {
  ssr: false,
});

const getTransactionQuery = gql`
  query GetTransaction($hash: String!) {
    transaction(hash: $hash) {
      hash
      vin {
        address
      }
      vout {
        address
      }
    }
  }
`;

const truncateAddress = (address) => {
  return address.length > 10 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;
};

const formatData = (data) => {
  const nodes = [];
  const links = [];

  if (!data || !data.transaction) {
    return { nodes, links };
  }

  const { transaction } = data;

  // Add the transaction node
  nodes.push({
    id: transaction.hash,
    label: truncateAddress(transaction.hash), // Truncate hash for display
    group: "transaction",
  });

  // Add vin nodes and links
  transaction.vin.forEach((vin) => {
    nodes.push({
      id: vin.address,
      label: truncateAddress(vin.address), // Truncate address for display
      group: "vin",
    });
    links.push({
      source: vin.address,
      target: transaction.hash,
      type: "FUNDS",
    });
  });

  // Add vout nodes and links
  transaction.vout.forEach((vout) => {
    nodes.push({
      id: vout.address,
      label: truncateAddress(vout.address), // Truncate address for display
      group: "vout",
    });
    links.push({
      source: transaction.hash,
      target: vout.address,
      type: "OUTPUT",
    });
  });

  return { nodes, links };
};


export default function Home() {
  const [hash, setHash] = useState("");
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  const { data, refetch } = useQuery(getTransactionQuery, {
    variables: { hash },
    skip: true,
    onCompleted: (data) => setGraphData(formatData(data)),
  });

  const handleSearch = () => {
    if (hash) {
      refetch({ hash });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 to-black text-white">
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Transaction Visualizer</h1>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Enter transaction hash"
              className="p-2 rounded-lg text-black"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
            />
            <button
              className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-700"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
        </div>
      </div>
      <div className="h-screen">
      <NoSSRForceGraph
  graphData={graphData}
  nodeAutoColorBy="group"
  linkDirectionalParticles={2}
  linkDirectionalParticleSpeed={0.02}
  nodeCanvasObject={(node, ctx) => {
    const label = node.label.slice(0, 5) + "..." + node.label.slice(-5); // Abbreviated address
    const fontSize = 2; // Fixed small font size
    const radius = 5; // Fixed node size

    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Set node colors based on group
    ctx.fillStyle =
      node.group === "transaction"
        ? "cyan"
        : node.group === "vin"
        ? "orange"
        : "green";

    // Draw the node (circle)
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fill();

    // Add the label (abbreviated address or hash)
    ctx.fillStyle = "black";
    ctx.fillText(label, node.x, node.y); // Center text inside the node
  }}
  linkCanvasObject={(link, ctx) => {
    // Set link colors based on type
    ctx.strokeStyle = link.type === "FUNDS" ? "green" : "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(link.source.x, link.source.y);
    ctx.lineTo(link.target.x, link.target.y);
    ctx.stroke();
  }}
/>

      </div>
    </div>
  );
}
