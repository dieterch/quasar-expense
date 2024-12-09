<template>
  <div v-ripple>
    <!--q-chip
      dense
      size="lg"
      icon="airport_shuttle"
      style="margin-top: 10px; background: transparent;"
      :label="props.selectedTrip.name"
      /-->

      <div class="text-h6">
      {{  props.selectedTrip.name }}
      <q-badge transparent align="center" color="primary">
        toggle
      </q-badge>
    </div>

  </div>
</template>

<script setup>
  const props = defineProps(["selectedTrip"]);
</script>
