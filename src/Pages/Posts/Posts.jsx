import React, {useEffect, useState, useRef, useCallback} from 'react';
import PostListItem from '../../components/PostListItem/PostListItem';
import axios from 'axios';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import './Posts.css'

const Posts = () => {

    const matches = useMediaQuery('(min-width:1000px)');
    const smallMatches = useMediaQuery('(max-width:529px)');

    const [posts, setPosts] = useState([]);
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [count, setCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const lastObserver = useRef();
    const lastPostRef = useCallback(node => {
        if (isLoading) return;
        if (lastObserver.current) lastObserver.current.disconnect();
        lastObserver.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                if ( skip < count ) {
                    setSkip(prev => prev + 12);
                }
                else setHasMore(false); 
            }
        });
        if (node) lastObserver.current.observe(node);
    });


    const firstObserver = useRef();
    const firstPostRef = useCallback(
        node => { 
            if (firstObserver.current) firstObserver.current.disconnect();
            firstObserver.current = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting ) {
                    setSkip(0)
                    setHasMore(true);
                }
            });
        if (node) firstObserver.current.observe(node);
    });

    

    useEffect(() => {
        const getPosts = async () => {
            const postRes = await axios.get('http://localhost:5000/posts?limit=12');
            setPosts(postRes.data); 
            const countRes = await axios.get('http://localhost:5000/posts/info/count');
            setCount(countRes.data);
        }
        if (skip === 0) 
            {
                getPosts();
                return;
            }
        const getPostsPaginated = async (skip,limit) => {
            setIsLoading(true);
            const postRes = await axios.get(`http://localhost:5000/posts/?limit=${limit}&skip=${skip}`);
            if (postRes.data.length > 0) setPosts(prevPosts => [...prevPosts,...postRes.data]);
            setIsLoading(false);
        }
        getPostsPaginated(skip,12);
    },[skip]);


    return (
        <div className={matches ? "posts-page" : "posts-page-mobile"}>
            <div className={matches? "post-list" : smallMatches? "post-list-mobile" : "post-list-tablet" }>
                {posts.length > 0 && posts.map((post,i) => {
                    if (posts.length === i + 1) 
                        return <PostListItem innerRef={lastPostRef} key={post._id} post={post}/>  
                    else if (i === 0)
                        return <PostListItem innerRef={firstPostRef} key={post._id} post={post} />
                    else return <PostListItem key={post._id} post={post}/>    
                    }
                )}
            </div>
        </div>
    )
}

export default Posts
