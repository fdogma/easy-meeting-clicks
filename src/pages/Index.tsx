
import BookingCalendar from "../components/BookingCalendar";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agende uma Reunião</h1>
          <p className="text-gray-600 mt-2">Escolha o melhor horário para conversarmos</p>
        </div>
        <BookingCalendar />
      </div>
    </div>
  );
};

export default Index;
