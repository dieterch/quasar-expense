<template>
  <!--q-page class="flex flex-start"-->
  <q-page>
  <div class="row">
    <div
      class="bg-blue-5 col-1"
      style="height: 22px;"
    />
    <div
      class="bg-grey-5 col"
      style="height: 22px;"
    />
    <div
      class="bg-green-5 col-1"
      style="height: 22px;"
    />
  </div>
  <div class="bg-blue-1 col-6">
    <div class="col-12">
      <q-list>
        <div v-for="trip in trips">
        <q-item clickable>
          <q-item-section>
            <q-item-label class="text-h6" >{{ trip.name }}</q-item-label>
            <q-item-label caption lines="2">{{ new Date(trip.startDate).toLocaleDateString("de-CA", {year:"numeric", month: "2-digit", day:"2-digit"})}},  Participants:
              <span v-for="(e, index) in trip.users" :key="index">
                  {{ e.user.name }}<span v-if="index < trip.users.length - 1">, </span>
                </span>
            </q-item-label>
          </q-item-section>

          <q-item-section side top>
            <q-item-label caption>{{ trip.expenses.length}} Expenses</q-item-label>
            <div class="text-black">
              <q-icon name="delete" size="25px" @click="deleteTrip(trip)"/>
              <q-icon name="edit_note" size="25px" @click="editTrip(trip)"/>
            </div>
          </q-item-section>
        </q-item>
        <q-separator spaced inset />
        </div>
      </q-list>
    </div>
  </div>
  </q-page>
</template>

<script setup>
defineOptions({
  name: 'TripsPage'
});

import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'

const trips = ref([])

onMounted(async() => {
  const response  = await api.get('/api/trips')
  trips.value = response.data
})

const deleteTrip = (trip) => {
  alert(JSON.stringify({id: trip.id, trip: trip.name}))
  console.log('delete: ',trip.id, trip.name)
}

const editTrip = (trip) => {
  alert(JSON.stringify({id: trip.id, trip: trip.name}))
  console.log('edit:',trip.id, trip.name)
}

</script>
