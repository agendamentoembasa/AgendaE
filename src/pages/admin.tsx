import dynamic from 'next/dynamic';

const AdminPage = dynamic(() => import('../components/AdminPanel'), {
  ssr: false
});

export default AdminPage;