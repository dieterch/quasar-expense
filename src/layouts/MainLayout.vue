<template>
  <q-layout view="hHh Lpr fFf">
    <q-img
      src="background3.jpg"
      class="fit absolute"
    />
    <q-header elevated class="bg-primary" >
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          {{ $route.meta.title }}
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          Menu
        </q-item-label>

        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'

defineOptions({
  name: 'MainLayout'
})

const linksList = [
  {
    title: 'Trip Expenses',
    caption: 'Trip Expenses Page',
    icon: 'payments',
    link: '#'
  },
  {
    title: 'Trips',
    caption: 'Trips Page',
    icon: 'airport_shuttle',
    link: '#/trips'
  },
  {
    title: 'Users',
    caption: 'Users Page',
    icon: 'group',
    link: '#/users'
  },
  {
    title: 'Categories',
    caption: 'Categories Page',
    icon: 'category',
    link: '#/categories'
  },
  {
    title: 'All Expenses',
    caption: 'All Expenses Page',
    icon: 'account_balance_wallet',
    link: '#/allexpenses'
  },
  // {
  //   title: 'Test',
  //   caption: 'Test Page',
  //   icon: 'javascript',
  //   link: '#/test'
  // },
  // {
  //   title: 'Chart',
  //   caption: 'Chart Page',
  //   icon: 'chart',
  //   link: '#/chart'
  // }
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
