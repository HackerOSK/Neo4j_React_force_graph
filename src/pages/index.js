import dynamic from 'next/dynamic'
import { useQuery,gql } from '@apollo/client';
import { useState } from 'react';

const mostRecentQuery = gql`
query {
  articles(limit: 5, sort:{created:DESC}) {
    __typename
    id
    url
    title
    score
    created
  }
}
`




const NoSSRForceGraph = dynamic(() => import('./lib/NoSSRForceGraph'), {ssr: false})

// const myData = {
//   nodes: [
//     { id: '1', label: 'Node 1' },
//     { id: '2', label: 'Node 2' },
//     { id: '3', label: 'Node 3' },
//   ],
//   links: [
//     { source: '1', target: '2' },
//     { source: '1', target: '3' },
//   ]
// }

const formatData = (data) =>{
  const nodes = [];
  const links =[];

  if(!data.articles)
    {
      return {nodes,links}
    }
  data.articles.forEach( (a)=> {
    nodes.push({
      id: a.score,
      title: a.title,
      url: a.url,
      created: a.created
    })

    nodes.push({
      id: a.user
    })

    links.push({
      source:a.user,
      target:a.score
    })
    
  });

  return {nodes,links}
}

export default function Home() {
  const [graphData, setGraphData] = useState({nodes:[], links:[]})
  const {data} = useQuery(mostRecentQuery, {
    onCompleted: (data) => setGraphData(formatData(data))
  })
  return (
    <>
    <NoSSRForceGraph graphData={graphData}/>
    </>
  )
}
