import Topbar from "@/components/Topbar"
import { useMusicStore } from "@/stores/useMusicStore";
import { useEffect } from "react";
import FeaturedSection from "./components/FeaturedSection";
import { ScrollArea } from "@/components/ui/scroll-area";
import SectionGrid from "./components/SectionGrid";
import { usePlayerStore } from "@/stores/usePlayerStore";
const Home = () => {
  const {fetchFeaturedSongs ,
      fetchMadeForYouSongs,
      fetchTrendingSongs, 
       isLoading ,
       madeForYouSongs,
      featuredSongs,
       trendingSongs} = useMusicStore();
    const {initializeQueue} = usePlayerStore();

       useEffect(() => {
        fetchFeaturedSongs();
        fetchMadeForYouSongs();
        fetchTrendingSongs();
       }, [fetchFeaturedSongs, fetchMadeForYouSongs, fetchTrendingSongs]);

       useEffect(() => {
         if(madeForYouSongs.length > 0 && featuredSongs.length > 0 && trendingSongs.length > 0){
          const allSongs = [...madeForYouSongs, ...featuredSongs, ...trendingSongs];
          initializeQueue(allSongs);
         }
       },[initializeQueue, madeForYouSongs, featuredSongs, trendingSongs]);
       console.log({isLoading, madeForYouSongs, featuredSongs, trendingSongs})
  return (
    <main className="rounded-md overflow-hidden h-full bg-gradient-to-b from bg-zinc-900 to zinc-800">
        <Topbar/>
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="p-4 sm:p-6">
            <h1 className="text-2xl font-bold mb-6 sm:text-3xl">Good Afternoon</h1>    
            <FeaturedSection/>
          
          <div className="space-y-8">
            <SectionGrid title="Made For You" songs={madeForYouSongs} isLoading= {isLoading}/>
            <SectionGrid title="Trending" songs={trendingSongs} isLoading= {isLoading}/>
          </div>
          </div>
        </ScrollArea>
    </main>
  )
}

export default Home
