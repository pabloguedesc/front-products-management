<template>
  <div>
    <div class="card">
      <TableComponent
        @edit-product-emit="editProduct"
        @delete-product-emit="confirmDeleteProduct"
        @open-new-dialog-emit="openNew"
        :products="products"
      />

      <Dialog
        v-model:visible="productDialog"
        :style="{ width: '450px' }"
        header="Detalhes do Produto"
        :modal="true"
        class="p-fluid"
      >
        <div class="field">
          <label for="name">Name</label>
          <InputText
            id="name"
            v-model.trim="product.name"
            required="true"
            autofocus
            :class="{ 'p-invalid': submitted && !product.name }"
          />
          <small class="p-error" v-if="submitted && !product.name">Campo obrigatório.</small>
        </div>

        <div class="field">
          <label for="description">Descrição</label>
          <div>
            <InputText
              id="description"
              v-model.trim="product.description"
              required="true"
              autofocus
              :class="{ 'p-invalid': submitted && !product.description }"
            />
            <small class="p-error" v-if="submitted && !product.description">
              Campo obrigatório.
            </small>
          </div>
        </div>

        <div class="grid" style="display: flex; flex-direction: row">
          <div class="field">
            <label for="price">Price</label>
            <InputNumber
              id="price"
              v-model="product.price"
              mode="currency"
              currency="USD"
              locale="en-US"
            />
            <small class="p-error" v-if="submitted && !product.price">Campo obrigatório.</small>
          </div>

          <div class="field">
            <label for="expiry_date">Data de Validade</label>
            <Calendar v-model="product.expiry_date" date-format="dd/mm/yy" />
            <small class="p-error" v-if="submitted && !product.expiry_date">
              Campo obrigatório.
            </small>
          </div>
        </div>

        <div class="field">
          <label for="category">Categoria</label>
          <Dropdown
            v-model="product.category_id"
            :options="categories"
            optionLabel="name"
            option-value="id"
            placeholder="Selecione a Categoria"
            class="w-full md:w-14rem"
          />
          <small class="p-error" v-if="submitted && !product.category_id">
            Seleção obrigatória.
          </small>
        </div>

        <div class="field">
          <label for="image">Imagem</label>

          <div>
            <Toast />
            <FileUpload
              name="image"
              url="http://localhost:8000/api/product/upload-image"
              @upload="onAdvancedUpload($event)"
              :multiple="true"
              accept="image/*"
              :maxFileSize="1000000"
            >
              <template #empty>
                <p>Arraste e solte os arquivos aqui para fazer upload.</p>
              </template>
            </FileUpload>
          </div>

          <small class="p-error" v-if="submitted && !product.image">Campo obrigatório.</small>
        </div>

        <template #footer>
          <Button label="Cancelar" icon="pi pi-times" text @click="hideDialog" />
          <Button label="Registrar" icon="pi pi-check" text @click="saveProduct" />
        </template>
      </Dialog>

      <Dialog
        v-model:visible="deleteProductDialog"
        :style="{ width: '450px' }"
        header="Confirme"
        :modal="true"
      >
        <div class="confirmation-content">
          <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
          <span v-if="product"
            >Apagar permanentemente: <b>{{ product.name }}</b
            >?</span
          >
        </div>
        <template #footer>
          <Button label="Não" icon="pi pi-times" text @click="deleteProductDialog = false" />
          <Button label="Sim" icon="pi pi-check" text @click="removeProduct" />
        </template>
      </Dialog>

      <Toast />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { format } from 'date-fns'
import {
  listAllProducts,
  saveNewProduct,
  deleteProduct,
  updateProduct
} from '@/services/product/ProductService'

import { listAllCategories } from '@/services/category/categoryServices'
import { type ICategory } from '@/services/category/dto/categoryDto'
import { type IPaginatedResponseDto } from '@/services/product/dto/listProductsDto'
import { type IProduct } from '@/services/product/dto/productDto'
import TableComponent from '@/components/TableComponent.vue'
import FileUpload from 'primevue/fileupload'

const toast = useToast()

function formatDate(input: string | Date): string {
  return format(new Date(input), 'dd/MM/yyyy')
}

function dateFormatterToApi(date: Date) {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

function showSuccessToast(message: string) {
  toast.add({ severity: 'success', summary: 'Sucesso', detail: message, life: 3000 })
}

function showErrorToast(message: string) {
  toast.add({ severity: 'error', summary: 'Erro', detail: message, life: 3000 })
}
const defaultPaginatedResponse: IPaginatedResponseDto = {
  current_page: 1,
  data: [],
  first_page_url: '',
  from: 1,
  last_page: 1,
  last_page_url: '',
  links: [],
  next_page_url: null,
  path: '',
  per_page: 10,
  prev_page_url: null,
  to: 1,
  total: 0
}

const productDefaultData: IProduct = {
  category_id: '',
  created_at: new Date(),
  description: '',
  expiry_date: '',
  id: '',
  image: '',
  name: '',
  price: 0,
  updated_at: new Date(),
  imageUrl: '',
  category: {
    id: '',
    name: '',
    created_at: new Date(),
    updated_at: new Date()
  }
}

const product = ref<IProduct>(productDefaultData)
const products = ref<IPaginatedResponseDto>(defaultPaginatedResponse)
const productDialog = ref(false)
const deleteProductDialog = ref(false)
const submitted = ref(false)
const categories = ref<ICategory[]>([])

function editProduct(prod: IProduct) {
  product.value = { ...prod }
  productDialog.value = true
}

const onAdvancedUpload = (e: any) => {
  const response = JSON.parse(e.xhr.response)

  product.value.image = response.path
}

function confirmDeleteProduct(prod: IProduct) {
  product.value = prod
  deleteProductDialog.value = true
}

async function removeProduct() {
  try {
    await deleteProduct(product.value.id)
    showSuccessToast('Produto removido com sucesso')
    fetchAll()
    deleteProductDialog.value = false
  } catch (error: any) {
    console.error('Erro ao deletar produto:', error)
    showErrorToast(error.response.data.error)
  }
}

async function fetchAll() {
  try {
    const response = await listAllProducts({
      filterValue: '',
      item: 'name',
      take: 20,
      page: 1
    })

    response.data.data.forEach((prod) => {
      prod.expiry_date = formatDate(prod.expiry_date)
      prod.created_at = formatDate(prod.created_at)
      prod.updated_at = formatDate(prod.updated_at)
    })

    products.value = response.data

    const responseCategory = await listAllCategories()
    categories.value = responseCategory.data
  } catch (error: any) {
    console.error('Erro ao obter produtos:', error)
    showErrorToast(error.response.data.error)
  }
}

onMounted(async () => {
  fetchAll()
})

function clearProductFields() {
  product.value = { ...productDefaultData }
}

function openNew() {
  clearProductFields()
  submitted.value = false
  productDialog.value = true
}

function hideDialog() {
  clearProductFields()
  productDialog.value = false
  submitted.value = false
}

const isFormValid = computed(() => {
  const { category_id, description, expiry_date, image, name, price } = product.value
  return category_id && description && expiry_date && image && name && price !== null
})

async function saveProduct() {
  submitted.value = true

  if (isFormValid.value) {
    const { category_id, description, expiry_date, image, name, price } = product.value

    try {
      if (product.value.id) {
        await updateProduct(product.value.id, {
          category_id,
          description,
          expiry_date: dateFormatterToApi(new Date(expiry_date)),
          image,
          name,
          price
        })
        showSuccessToast('Produto atualizado com sucesso')
      } else {
        await saveNewProduct({
          category_id,
          description,
          expiry_date: dateFormatterToApi(new Date(expiry_date)),
          image,
          name,
          price
        })
        showSuccessToast('Produto criado com sucesso')
      }
      fetchAll()
      hideDialog()
    } catch (error: any) {
      console.error('Erro ao criar/atualizar produto:', error)
      showErrorToast(error.response.data.error)
    }
  } else {
    showErrorToast('Por favor, preencha todos os campos obrigatórios')
  }
}
</script>
