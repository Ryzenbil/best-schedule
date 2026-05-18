<template>
  <div class="admin-classrooms">
    <h2>Управление кабинетами</h2>
    <button class="add-btn" @click="openModal">+ Добавить кабинет</button>
    <div class="classrooms-grid">
      <div v-for="room in classrooms" :key="room.id" class="classroom-card">
        <div class="classroom-name">{{ room.name }}</div>
        <div class="classroom-capacity">Вместимость: {{ room.capacity }}</div>
        <div class="classroom-type">{{ translateType(room.type) }}</div>
        <button class="delete-btn" @click="deleteClassroom(room.id)">Удалить</button>
      </div>
    </div>

    <!-- Модалка создания/редактирования -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Новый кабинет</h3>
          <button class="modal-close" @click="showModal = false">&times;</button>
        </div>
        <div class="modal-content">
          <div class="form-group">
            <label>Название</label>
            <input v-model="newRoom.name" />
          </div>
          <div class="form-group">
            <label>Вместимость (количество мест)</label>
            <input type="number" v-model="newRoom.capacity" />
          </div>
          <div class="form-group">
            <label>Тип</label>
            <select v-model="newRoom.type">
              <option value="AUDITORIUM">Аудитория</option>
              <option value="LABORATORY">Лаборатория</option>
              <option value="GYM">Спортзал</option>
            </select>
          </div>
          <div class="form-actions">
            <button class="submit-btn" @click="createClassroom">Создать</button>
            <button class="cancel-btn" @click="showModal = false">Отмена</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { graphqlRequest } from '../api'

const classrooms = ref([])
const showModal = ref(false)
const newRoom = ref({ name: '', capacity: null, type: 'AUDITORIUM' })

const loadClassrooms = async () => {
  const data = await graphqlRequest(`
    query {
      classrooms {
        id
        name
        capacity
        type
      }
    }
  `)
  classrooms.value = data.classrooms
}

const createClassroom = async () => {
  await graphqlRequest(`
    mutation CreateClassroom($input: ClassroomInput!) {
      createClassroom(input: $input) {
        id
        name
        capacity
        type
      }
    }
  `, {
    input: {
      name: newRoom.value.name,
      capacity: newRoom.value.capacity ? parseInt(newRoom.value.capacity) : null,
      type: newRoom.value.type
    }
  })
  showModal.value = false
  newRoom.value = { name: '', capacity: null, type: 'AUDITORIUM' }
  await loadClassrooms()
}

const deleteClassroom = async (id) => {
  if (confirm('Удалить кабинет?')) {
    await graphqlRequest(`mutation DeleteClassroom($id: ID!) { deleteClassroom(id: $id) }`, { id })
    await loadClassrooms()
  }
}

const translateType = (type) => {
  const types = { AUDITORIUM: 'Аудитория', LABORATORY: 'Лаборатория', GYM: 'Спортзал' }
  return types[type] || type
}

onMounted(loadClassrooms)
</script>

<style scoped>
.admin-classrooms { padding: 20px; }
.classrooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 20px;
}
.classroom-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.classroom-name { font-weight: bold; font-size: 1.2rem; }
.delete-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 8px;
  margin-top: 8px;
  cursor: pointer;
}
.add-btn {
  background: #1e8f84;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
}
</style>