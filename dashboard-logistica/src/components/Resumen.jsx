import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';

export default function Resumen() {
  return (
    <div>
      <Row>
        <Col md={4}>
          <Card className="custom-card text-center shadow-sm mb-3">
            <Card.Body p={4}>
              <Card.Title className="text-muted fw-normal" style={{fontSize: '16px'}}>Total Agendados</Card.Title>
              <h1 className="display-4 fw-bold text-accent" style={{fontSize: '60px', color: 'var(--accent-color)'}}>8</h1>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="custom-card text-center shadow-sm mb-3">
            <Card.Body p={4}>
              <Card.Title className="text-muted fw-normal" style={{fontSize: '16px'}}>En Proceso</Card.Title>
              <h1 className="display-4 fw-bold text-accent" style={{fontSize: '60px', color: 'var(--accent-color)'}}>3</h1>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="custom-card text-center shadow-sm mb-3">
            <Card.Body p={4}>
              <Card.Title className="text-muted fw-normal" style={{fontSize: '16px'}}>Listos para Entregar</Card.Title>
              <h1 className="display-4 fw-bold text-accent" style={{fontSize: '60px', color: 'var(--accent-color)'}}>2</h1>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}