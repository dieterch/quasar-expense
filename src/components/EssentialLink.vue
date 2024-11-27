<template>
  <q-item clickable tag="a" notarget="_blank" :href="props.link">
    <q-item-section>
      <q-item-label
        ><b>{{ props.title }}</b></q-item-label
      >
      <!--q-item-label caption>{{ props.caption }}</q-item-label-->
    </q-item-section>

    <q-item-section v-if="props.icon" avatar side>
      <q-icon :name="props.icon" />
    </q-item-section>
  </q-item>
</template>

<script setup>
defineOptions({
  name: "EssentialLink",
});

const props = defineProps({
  title: {
    type: String,
    required: true,
  },

  caption: {
    type: String,
    default: "",
  },

  link: {
    type: String,
    default: "#",
  },

  icon: {
    type: String,
    default: "",
  },
});
</script>
