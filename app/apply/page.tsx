import { Suspense } from 'react';
import ApplyForm from './ApplyForm';

export default function ApplyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ApplyForm />
    </Suspense>
  );
}
