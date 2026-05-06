import { Card } from './Card.jsx'

export default {
  title: 'UI/Card',
  component: Card,
}

export const Default = {
  render: () => <Card>Default card content</Card>,
}

export const Alert = {
  render: () => <Card variant="alert">Alert card content</Card>,
}

