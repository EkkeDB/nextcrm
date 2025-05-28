// File: /c:/Mis_Proyectos/Python/NextCRM/frontend/src/hooks/useContractForm.ts
// Fix the submitContract function to use correct field names

// Update only the submitContract function in your existing useContractForm.ts:

const submitContract = useCallback(async (): Promise<boolean> => {
  try {
    setIsLoading(true);
    
    // Validate all steps
    const allStepsValid = [1, 2, 3, 4, 5, 6].every(step => validateStep(step));
    
    if (!allStepsValid) {
      toast.error('Please fix all validation errors before submitting');
      return false;
    }

    // Calculate total value
    const totalValue = (formData.quantity || 0) * (formData.pricePerUnit || 0);
    
    // Prepare contract data for API with CORRECT field names
    const contractData: Partial<Contract> = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      // Use the correct field names that match Django backend
      commodity_id: formData.commodityId,
      counterparty_id: formData.counterpartyId,
      trader_id: formData.traderId,
      quantity: formData.quantity || 0,
      unit: formData.unit || '',
      price_per_unit: formData.pricePerUnit || 0,
      total_value: totalValue,
      currency: formData.currency || 'USD',
      payment_terms: formData.paymentTerms || '',
      start_date: formData.startDate || '',
      end_date: formData.endDate || '',
      delivery_date: formData.deliveryDate || '',
      delivery_location: formData.deliveryLocation || '',
      delivery_terms: formData.deliveryTerms || '',
      delivery_instructions: formData.deliveryInstructions || '',
      status: 'draft',
    };

    // Submit to real API
    await contractsApi.createContract(contractData);
    
    // Clear draft after successful submission
    clearDraft();
    
    toast.success('Contract created successfully!');
    return true;
    
  } catch (error) {
    console.error('Error submitting contract:', error);
    const apiError = error as ApiError;
    toast.error(apiError.message || 'Failed to create contract. Please try again.');
    return false;
  } finally {
    setIsLoading(false);
  }
}, [formData, validateStep, clearDraft]);