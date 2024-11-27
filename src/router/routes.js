const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '',meta: { title: 'Home' }, component: () => import('pages/Home.vue') },
      { path: 'trips' ,meta: { title: 'Trips' } , component: () => import('pages/Trips.vue') },
      { path: 'users',meta: { title: 'Users' }, component: () => import('pages/Users.vue') },
      { path: 'categories',meta: { title: 'Categories' }, component: () => import('pages/Categories.vue') },
      { path: 'expenses',meta: { title: 'All Expenses' }, component: () => import('pages/Expenses.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
