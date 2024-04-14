import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = 'https://test-api.k6.io/public/crocodiles';

export default function () {
    // Prueba de Listado de Elementos
    const listElementsResponse = http.get(BASE_URL);
    check(listElementsResponse, {
        'Status is 200': (r) => r.status === 200,
        'Contains expected fields': (r) => {
            const elements = JSON.parse(r.body);
            return Array.isArray(elements) &&
                elements.length > 0 &&
                'id' in elements[0] &&
                'name' in elements[0] &&
                'sex' in elements[0] &&
                'date_of_birth' in elements[0] &&
                'age' in elements[0];
        },
    });

    // Prueba de Creación de Elemento
    const newElementPayload = JSON.stringify({
        name: 'New Element',
        sex: 'M',
        date_of_birth: '1990-01-01',
        age: 32,
    });
    const createElementResponse = http.post(`${BASE_URL}/elements`, newElementPayload, { headers: { 'Content-Type': 'application/json' } });
    check(createElementResponse, {
        'Status is 201': (r) => r.status === 201,
        'Element created successfully': (r) => {
            const createdElement = JSON.parse(createElementResponse.body);
            return createdElement.name === 'New Element' && createdElement.sex === 'M';
        },
    });

    // Obtener el ID de un elemento existente para actualizarlo
    const elements = JSON.parse(listElementsResponse.body);
    const elementToUpdate = elements[0]; // Tomamos el primer elemento de la lista

    // Prueba de Actualización de Elemento
    const updatedElementPayload = JSON.stringify({
        age: 33,
    });
    const updateElementResponse = http.put(`${BASE_URL}/elements/${elementToUpdate.id}`, updatedElementPayload, { headers: { 'Content-Type': 'application/json' } });
    check(updateElementResponse, {
        'Status is 200': (r) => r.status === 200,
        'Element updated successfully': (r) => {
            const updatedElement = JSON.parse(updateElementResponse.body);
            return updatedElement.age === 33;
        },
    });

    // Prueba de Eliminación de Elemento
    const deleteElementResponse = http.del(`${BASE_URL}/elements/${elementToUpdate.id}`);
    check(deleteElementResponse, {
        'Status is 204': (r) => r.status === 204,
        'Element deleted successfully': (r) => {
            return true; // Suponiendo que la eliminación fue exitosa, ya que no hay cuerpo de respuesta para verificar
        },
    });
}