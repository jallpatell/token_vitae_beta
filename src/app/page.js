import MainLanding from '../pages/MainLanding'
import PriceQueryForm from '../components/PriceQueryForm';
import TokenHistory from '../components/TokenHistory';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-row items-center justify-center bg-black-900">
      <MainLanding />
    </main>
  );
}
