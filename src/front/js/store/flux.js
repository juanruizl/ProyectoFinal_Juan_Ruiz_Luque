const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			// Estado inicial de la aplicación.
			token: null,
			user_id: null,
			currentUser: null,
			transactions: [],
			projects: [],
			budgets: [],
			employees: [],
			chartUrl: null,
			errorMessage: null,
			loading: false,
		},

		// Acciones que manejan el estado y la lógica de negocio de la aplicación.
		actions: {
			// Sincronizo el token y el ID del usuario desde sessionStorage al estado.
			syncTokenFromSessionStorage: async () => {
				const token = sessionStorage.getItem("token");
				const user_id = sessionStorage.getItem("user_id");

				console.log("Token encontrado en sessionStorage:", token);

				// Verifico si el token es válido.
				if (token && token.split(".").length === 3) {
					setStore({ token, user_id });

					// Si no tengo el usuario actual, lo obtengo del backend.
					if (!getStore().currentUser) {
						try {
							await getActions().getCurrentUser();
						} catch (error) {
							console.error("Error al sincronizar usuario:", error.message);
							// Limpio el token y el estado si falla.
							sessionStorage.removeItem("token");
							sessionStorage.removeItem("user_id");
							setStore({ token: null, user_id: null, currentUser: null });
						}
					}
				} else {
					console.warn("No se encontró un token válido en sessionStorage.");
					// Limpio el estado si no hay token válido.
					sessionStorage.removeItem("token");
					sessionStorage.removeItem("user_id");
					setStore({ token: null, user_id: null });
				}
			},

			// Inicio sesión con el email y contraseña.
			login: async (email, password) => {
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/login`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ email, password }),
					});

					if (response.ok) {
						// Guardo el token y el ID del usuario si el login es exitoso.
						const data = await response.json();
						setStore({
							token: data.token,
							user_id: data.user_id,
						});
						sessionStorage.setItem("token", data.token);
						sessionStorage.setItem("user_id", data.user_id);
						return true;
					} else {
						// Manejo errores de login.
						const errorData = await response.json();
						console.error("Error en login:", errorData.msg || response.statusText);
						return false;
					}
				} catch (error) {
					console.error("Error en login:", error.message);
					return false;
				}
			},


			// Registro un nuevo usuario con los datos proporcionados.
			register: async (formData) => {
				try {
					const resp = await fetch(`${process.env.BACKEND_URL}/api/register`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(formData),
					});

					// Verifico si la respuesta es correcta.
					if (!resp.ok) {
						const errorData = await resp.json();
						throw new Error(errorData.message || "Error al registrar el usuario");
					}

					return true;
				} catch (error) {
					console.error("Error al registrar usuario:", error);
					return false;
				}
			},

			// Cierro sesión eliminando el token y limpiando el estado.
			logout: () => {
				setStore({ token: null, user_id: null, currentUser: null });
				sessionStorage.removeItem("token");
				sessionStorage.removeItem("user_id");
			},

			// Obtengo la información del usuario actual utilizando el token.
			getCurrentUser: async () => {
				const store = getStore();
				const user_id = store.user_id || sessionStorage.getItem("user_id");

				// Verifico si hay token y user_id disponibles.
				if (!store.token || !user_id) {
					console.warn("No hay token o user_id disponible para obtener el usuario.");
					return;
				}

				try {
					// Si el usuario no está cargado, lo obtengo del backend.
					if (!store.currentUser) {
						const response = await fetch(`${process.env.BACKEND_URL}/api/users/${user_id}`, {
							method: "GET",
							headers: {
								Authorization: `Bearer ${store.token}`,
								"Content-Type": "application/json",
							},
						});

						if (response.ok) {
							const user = await response.json();
							setStore({ currentUser: user });
						} else {
							console.error("Error al obtener el usuario:", response.statusText);
						}
					}
				} catch (error) {
					console.error("Error en getCurrentUser:", error.message);
				}
			},



			// Hago una solicitud con el token, añadiéndolo a los headers.
			fetchWithToken: async (url, options = {}) => {
				const store = getStore();

				// Verifico si hay un token disponible.
				if (!store.token) {
					console.error("Token no disponible. Asegúrate de estar autenticado.");
					throw new Error("Token no disponible. Inicia sesión nuevamente.");
				}

				try {
					// Hago la solicitud al backend con el token incluido en los headers.
					const response = await fetch(url, {
						...options,
						headers: {
							...options.headers,
							Authorization: `Bearer ${store.token}`,
							"Content-Type": "application/json",
						},
					});

					// Manejo errores si la respuesta no es exitosa.
					if (!response.ok) {
						if (response.status === 401) {
							console.error("Token inválido o expirado. Cerrando sesión.");
							getActions().logout();
						}
						const errorData = await response.json();
						throw new Error(errorData.message || `Error ${response.status}`);
					}

					return await response.json(); // Devuelvo la respuesta en formato JSON.
				} catch (error) {
					console.error("Error en fetchWithToken:", error.message);
					throw error;
				}
			},

			// Obtengo una lista de entidades desde un endpoint y actualizo el estado.
			fetchEntities: async (endpoint, storeKey) => {
				setStore({ loading: true }); // Indico que los datos están cargándose.
				try {
					const data = await getActions().fetchWithToken(
						`${process.env.BACKEND_URL}/api/${endpoint}`
					);
					setStore({ [storeKey]: data || [] }); // Almaceno las entidades en el estado.
				} catch (error) {
					console.error(`Error al obtener ${storeKey}:`, error.message);
					setStore({ [storeKey]: [] }); // Limpio el estado si ocurre un error.
				} finally {
					setStore({ loading: false }); // Indico que la carga ha terminado.
				}
			},

			// Creo una nueva entidad y la añado al estado.
			createEntity: async (endpoint, storeKey, data) => {
				const store = getStore();
				try {
					const entity = await getActions().fetchWithToken(
						`${process.env.BACKEND_URL}/api/${endpoint}`,
						{
							method: "POST",
							body: JSON.stringify(data),
						}
					);
					// Actualizo el estado añadiendo la nueva entidad.
					setStore({ [storeKey]: [...store[storeKey], entity] });
					return true;
				} catch (error) {
					console.error(`Error al crear en ${endpoint}:`, error);
					return false;
				}
			},

			// Actualizo una entidad específica y modifico el estado.
			updateEntity: async (endpoint, id, storeKey, data) => {
				const store = getStore();
				try {
					const entity = await getActions().fetchWithToken(
						`${process.env.BACKEND_URL}/api/${endpoint}/${id}`,
						{
							method: "PUT",
							body: JSON.stringify(data),
						}
					);
					// Actualizo la entidad modificada en el estado.
					const updatedStore = store[storeKey].map((item) =>
						item.id === id ? entity : item
					);
					setStore({ [storeKey]: updatedStore });
					return true;
				} catch (error) {
					console.error(`Error al actualizar en ${endpoint}:`, error);
					return false;
				}
			},


			// Elimino una entidad específica y actualizo el estado eliminándola de la lista.
			deleteEntity: async (endpoint, id, storeKey) => {
				const store = getStore();
				try {
					// Hago la solicitud DELETE al backend con el ID de la entidad.
					await getActions().fetchWithToken(
						`${process.env.BACKEND_URL}/api/${endpoint}/${id}`,
						{ method: "DELETE" }
					);

					// Actualizo el estado eliminando la entidad del store.
					const updatedStore = store[storeKey].filter((item) => item.id !== id);
					setStore({ [storeKey]: updatedStore });
				} catch (error) {
					console.error(`Error al eliminar en ${endpoint}:`, error);
				}
			},

			// Cargo todas las transacciones asociadas al usuario actual.
			loadTransactions: async () => {
				const { fetchWithToken } = getActions();
				const store = getStore();

				// Verifico que haya un token disponible antes de continuar.
				if (!store.token) {
					console.warn("No se puede cargar transacciones: token no disponible.");
					return;
				}

				try {
					// Obtengo las transacciones desde el backend.
					const transactions = await fetchWithToken(`${process.env.BACKEND_URL}/api/transactions`);
					setStore({ transactions }); // Actualizo el estado con las transacciones cargadas.
					return transactions;
				} catch (error) {
					console.error("Error al cargar transacciones:", error.message);
					setStore({ transactions: [] }); // Limpio el estado si ocurre un error.
					throw error;
				}
			},

			// Cargo los proyectos asociados al usuario.
			loadProjects: async () =>
				await getActions().fetchEntities("projects", "projects"),

			// Cargo los presupuestos registrados por el usuario.
			loadBudgets: async () =>
				await getActions().fetchEntities("budgets", "budgets"),

			// Cargo los empleados asociados al usuario.
			loadEmployees: async () =>
				await getActions().fetchEntities("employees", "employees"),

			// Cargo los datos del gráfico de transacciones y devuelvo la URL del gráfico generado.
			loadChart: async (startDate, endDate) => {
				try {
					let url = `${process.env.BACKEND_URL}/api/chart`;

					// Construyo la URL con los parámetros de fecha si se proporcionan.
					if (startDate || endDate) {
						const params = new URLSearchParams();
						if (startDate) params.append("start_date", startDate);
						if (endDate) params.append("end_date", endDate);
						url += `?${params.toString()}`;
					}

					// Obtengo los datos del gráfico desde el backend.
					const chartData = await getActions().fetchWithToken(url);

					if (chartData && chartData.url) {
						return chartData.url; // Devuelvo la URL del gráfico generado.
					} else {
						throw new Error("No se pudo obtener la URL del gráfico.");
					}
				} catch (error) {
					console.error("Error al cargar datos del gráfico:", error.message);
					throw error;
				}
			},


			// Actualizo los datos del usuario actual.
			updateUser: async (userData) => {
				const store = getStore();
				const token = store.token;

				// Verifico que haya un token y un usuario actual.
				if (!token || !store.currentUser) {
					console.error("Token o usuario no disponible. Asegúrate de que el usuario esté autenticado.");
					return false;
				}

				try {
					// Hago la solicitud PUT al backend con los datos del usuario actualizados.
					const response = await fetch(`${process.env.BACKEND_URL}/api/users/${store.currentUser.id}`, {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify(userData),
					});

					// Si la solicitud es exitosa, actualizo el estado con los datos del usuario.
					if (response.ok) {
						const updatedUser = await response.json();
						setStore({ currentUser: updatedUser });
						console.log("Usuario actualizado con éxito:", updatedUser);
						return true;
					} else {
						const errorData = await response.json();
						console.error("Error al actualizar el usuario:", errorData.message || response.statusText);
						return false;
					}
				} catch (error) {
					console.error("Error en la solicitud de actualización:", error.message);
					return false;
				}
			},

			// Elimino la cuenta del usuario actual.
			deleteAccount: async () => {
				const store = getStore();
				const token = store.token;

				// Verifico que haya un token y un usuario actual.
				if (!token || !store.currentUser) {
					console.error("Token o usuario no disponible. Asegúrate de que el usuario esté autenticado.");
					return false;
				}

				try {
					// Hago la solicitud DELETE al backend para eliminar la cuenta del usuario.
					const response = await fetch(`${process.env.BACKEND_URL}/api/users/${store.currentUser.id}`, {
						method: "DELETE",
						headers: {
							Authorization: `Bearer ${token}`,
						},
					});

					// Si la solicitud es exitosa, elimino el token y el usuario del estado.
					if (response.ok) {
						sessionStorage.removeItem("token");
						sessionStorage.removeItem("user_id");
						setStore({ currentUser: null, token: null, user_id: null });
						console.log("Cuenta eliminada con éxito.");
						return true;
					} else {
						const errorData = await response.json();
						console.error("Error al eliminar la cuenta:", errorData.message || response.statusText);
						return false;
					}
				} catch (error) {
					console.error("Error en la solicitud de eliminación:", error.message);
					return false;
				}
			},
			convertCurrency: async (base, target, amount) => {
				const store = getStore();
				const token = store.token;
			
				// Verifica que el token esté disponible.
				if (!token) {
					console.error("Token no disponible. Asegúrate de estar autenticado.");
					return null;
				}
			
				try {
					// Construye la URL con los parámetros necesarios.
					const url = `${process.env.BACKEND_URL}/api/convert?base=${base}&target=${target}&amount=${amount}`;
			
					// Realiza la solicitud al backend con el token.
					const response = await fetch(url, {
						method: "GET",
						headers: {
							Authorization: `Bearer ${token}`, // Incluye el token en los headers.
							"Content-Type": "application/json",
						},
					});
			
					if (response.ok) {
						// Procesa y devuelve los datos de la conversión.
						const data = await response.json();
						console.log("Conversión realizada:", data);
						return data; // Devuelve los datos de conversión.
					} else {
						// Manejo de errores en la solicitud.
						const errorData = await response.json();
						console.error("Error al convertir moneda:", errorData.message || response.statusText);
						return null;
					}
				} catch (error) {
					console.error("Error en convertCurrency:", error.message);
					return null;
				}
			},			
		},
	};
};

export default getState;
