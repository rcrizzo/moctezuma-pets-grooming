import React, { useState } from 'react';
import { Row, Col, Badge, Modal, Form, ProgressBar, Table } from 'react-bootstrap';

// Datos simulados de productos y suministros
const inventarioMock = [
  { id: 'PRD-001', nombre: 'Croquetas Royal Canin Adulto 15kg', categoria: 'Tienda', stock: 12, minStock: 5, precio: '$1,850.00' },
  { id: 'SUM-082', nombre: 'Shampoo de Avena (Galón)', categoria: 'Grooming', stock: 2, minStock: 3, precio: 'Uso Interno' },
  { id: 'PRD-045', nombre: 'Juguete Kong Clásico (M)', categoria: 'Tienda', stock: 0, minStock: 4, precio: '$320.00' },
  { id: 'MED-012', nombre: 'Vacuna Múltiple (Dosis)', categoria: 'Veterinaria', stock: 25, minStock: 10, precio: 'Uso Interno' },
  { id: 'PRD-088', nombre: 'Correa Reflectiva 2m', categoria: 'Tienda', stock: 8, minStock: 5, precio: '$250.00' }
];

export default function Inventario() {

  const [showModal, setShowModal] = useState(false);

  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');

  // Filtrado de la tabla
  const productosFiltrados = inventarioMock.filter(prod => {
    const coincideBusqueda = prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) || prod.id.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = filtroCategoria === 'Todos' || prod.categoria === filtroCategoria;
    return coincideBusqueda && coincideCategoria;
  });

  // Lógica visual para el estado del stock
  const getEstadoStock = (stock, minStock) => {
    if (stock === 0) return { texto: 'Agotado', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', porcentaje: 0 };
    if (stock <= minStock) return { texto: 'Stock Bajo', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', porcentaje: (stock/minStock)*50 };
    return { texto: 'Suficiente', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', porcentaje: 100 };
  };

  return (
    <div>
      {/* 1. KPIs del Inventario */}
      <Row className="mb-4 gx-4">
        <Col md={4}>
          <div className="glass-card p-4 h-100 d-flex flex-column justify-content-center" style={{borderLeft: '4px solid var(--text-dark)'}}>
            <p className="text-muted fw-bold m-0" style={{fontSize: '12px', textTransform: 'uppercase'}}>Total de Artículos</p>
            <div className="d-flex align-items-center gap-3 mt-1">
              <h2 className="fw-bold m-0" style={{fontSize: '32px', color: 'var(--text-dark)'}}>145</h2>
              <span className="badge bg-light text-dark border">En catálogo</span>
            </div>
          </div>
        </Col>
        <Col md={4}>
          <div className="glass-card p-4 h-100 d-flex flex-column justify-content-center" style={{borderLeft: '4px solid #F59E0B'}}>
            <p className="text-muted fw-bold m-0" style={{fontSize: '12px', textTransform: 'uppercase'}}>Alertas de Reabastecimiento</p>
            <div className="d-flex align-items-center gap-3 mt-1">
              <h2 className="fw-bold m-0" style={{fontSize: '32px', color: '#F59E0B'}}>8</h2>
              <span className="badge" style={{backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B'}}>Stock Bajo</span>
            </div>
          </div>
        </Col>
        <Col md={4}>
          <div className="glass-card p-4 h-100 d-flex flex-column justify-content-center" style={{borderLeft: '4px solid #EF4444'}}>
            <p className="text-muted fw-bold m-0" style={{fontSize: '12px', textTransform: 'uppercase'}}>Artículos Agotados</p>
            <div className="d-flex align-items-center gap-3 mt-1">
              <h2 className="fw-bold m-0" style={{fontSize: '32px', color: '#EF4444'}}>3</h2>
              <span className="badge" style={{backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444'}}>Pérdida de ventas</span>
            </div>
          </div>
        </Col>
      </Row>

      {/* 2. Controles de Búsqueda y Tabla */}
      <div className="glass-card">
        <div className="p-4 p-md-5 border-bottom d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3" style={{ borderColor: 'var(--border-light)' }}>
          <div>
            <h3 className="fw-bold m-0" style={{fontSize: '20px'}}>Control de Existencias</h3>
            <p className="text-muted m-0" style={{fontSize: '14px'}}>Administra productos de venta y suministros de uso interno.</p>
          </div>
          
          <div className="d-flex flex-wrap gap-3">
            <Form.Select 
              className="custom-input" 
              style={{ width: '180px' }}
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            >
              <option value="Todos">Todas las áreas</option>
              <option value="Tienda">Tienda / Retail</option>
              <option value="Grooming">Suministros Estética</option>
              <option value="Veterinaria">Medicamentos / Vet</option>
            </Form.Select>

            <Form.Control 
              type="text" 
              placeholder="🔍 Buscar SKU o nombre..." 
              className="custom-input"
              style={{ width: '250px' }}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            
            <button onClick={() => setShowModal(true)} className="btn text-white fw-bold px-4 py-2" style={{backgroundColor: 'var(--accent)', borderRadius: '8px', whiteSpace: 'nowrap'}}>
              + Nuevo Artículo
            </button>
          </div>
        </div>

        <div className="p-0">
          <Table borderless hover responsive className="beauty-table m-0 align-middle">
            <thead>
              <tr>
                <th>Código / Artículo</th>
                <th>Área / Categoría</th>
                <th>Nivel de Stock</th>
                <th>Precio Público</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((prod) => {
                const estado = getEstadoStock(prod.stock, prod.minStock);
                return (
                  <tr key={prod.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div style={{width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'}}>
                          {prod.categoria === 'Tienda' ? '🛍️' : prod.categoria === 'Veterinaria' ? '💊' : '🧴'}
                        </div>
                        <div>
                          <span className="fw-bold d-block" style={{fontSize: '15px', color: 'var(--text-dark)'}}>{prod.nombre}</span>
                          <span className="text-muted d-block" style={{fontSize: '12px', letterSpacing: '0.5px'}}>SKU: {prod.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="fw-medium" style={{fontSize: '13px', color: '#4B5563', backgroundColor: '#F3F4F6', padding: '4px 10px', borderRadius: '6px'}}>
                        {prod.categoria}
                      </span>
                    </td>
                    <td style={{ width: '250px' }}>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-bold" style={{fontSize: '14px', color: 'var(--text-dark)'}}>{prod.stock} <span className="text-muted fw-normal">unidades</span></span>
                        <span style={{fontSize: '11px', fontWeight: 'bold', color: estado.color, backgroundColor: estado.bg, padding: '2px 8px', borderRadius: '12px'}}>
                          {estado.texto}
                        </span>
                      </div>
                      {/* Barra de progreso visual para el stock */}
                      <ProgressBar 
                        now={estado.porcentaje} 
                        style={{ height: '6px' }} 
                        variant={prod.stock === 0 ? 'danger' : prod.stock <= prod.minStock ? 'warning' : 'success'} 
                      />
                      <span className="text-muted d-block mt-1" style={{fontSize: '11px'}}>Mínimo ideal: {prod.minStock}</span>
                    </td>
                    <td>
                      <span className="fw-bold" style={{fontSize: '15px', color: prod.precio === 'Uso Interno' ? '#9CA3AF' : 'var(--text-dark)'}}>
                        {prod.precio}
                      </span>
                    </td>
                    <td className="text-end">
                      <button className="btn btn-sm fw-bold me-2" style={{color: 'var(--text-dark)', backgroundColor: '#E5E7EB'}}>Surtir</button>
                      <button className="btn btn-sm fw-bold" style={{color: 'var(--accent)'}}>Editar</button>
                    </td>
                  </tr>
                );
              })}
              
              {productosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    No se encontraron artículos con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>
      {/* Modal Nuevo Artículo */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border-light)' }}>
          <Modal.Title className="fw-bold" style={{ fontSize: '20px' }}>Alta de Producto / Suministro</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 p-md-5">
          <Form>
            <Row className="mb-4 gx-4">
              <Col md={8}>
                <Form.Group>
                  <Form.Label className="custom-label">Nombre del Artículo</Form.Label>
                  <Form.Control type="text" placeholder="Ej. Croquetas Adulto 15kg" className="custom-input" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="custom-label">Código (SKU)</Form.Label>
                  <Form.Control type="text" placeholder="PRD-000" className="custom-input" />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-4 gx-4">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="custom-label">Categoría</Form.Label>
                  <Form.Select className="custom-input">
                    <option>Tienda</option>
                    <option>Grooming</option>
                    <option>Veterinaria</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="custom-label">Stock Inicial</Form.Label>
                  <Form.Control type="number" min="0" className="custom-input" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="custom-label">Precio Público</Form.Label>
                  <Form.Control type="text" placeholder="$ 0.00 (Dejar en blanco si es uso interno)" className="custom-input" />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end mt-4">
              <button type="button" onClick={() => setShowModal(false)} className="btn px-4 py-2 fw-bold text-muted me-3">Cancelar</button>
              <button type="button" className="btn px-4 py-2 fw-bold text-white" style={{ backgroundColor: 'var(--accent)', borderRadius: '8px' }}>Guardar Artículo</button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}