'use server'

// TODO: Reactivar cuando se integre gateway de pago (Stripe/Conekta).
// La action original activaba featured_until sin verificación de pago,
// permitiendo a cualquier usuario autenticado obtener promoción gratis.

export async function activateProfilePromotion(_planDays: number) {
  return { error: 'Promociones temporalmente no disponibles. Estamos integrando el sistema de pagos.' }
}

