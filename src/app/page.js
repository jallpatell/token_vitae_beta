import PriceQueryForm from '../components/PriceQueryForm';
import TokenHistory from '../components/TokenHistory';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black-400">
      <PriceQueryForm />
    </main>
  );
}
