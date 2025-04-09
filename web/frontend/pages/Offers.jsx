import {
  IndexTable,
  LegacyCard,
  Text,
  useBreakpoints,
  Page,
  Button,
  ButtonGroup,
  Box,
} from '@shopify/polaris';
import React, { useState } from 'react';
import './OffersPageStyle.css';

function IndexTableWithoutCheckboxesExample() {
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Hardcoded offers with empty fields
  const offers = [
    {
      offer_ids: ['default_flash_deal_1'],
      name: 'Flash Deal Offer',
      used_this_month: 0,
      state: 'Inactive',
      type: 'default_flash_deal_offer',
      offer_url: 'https://stunion.cat-ops.ekanek.app/settings/default_offers',
      description_fields: {
        extra_discount: '',
        products_count: '',
        excluding_list_sku_names: [],
      },
    },
    {
      offer_ids: ['default_combo_builder_1'],
      name: 'Combo Builder Offer',
      used_this_month: 0,
      state: 'Inactive',
      type: 'default_combo_builder_offer',
      offer_url: 'https://stunion.cat-ops.ekanek.app/settings/default_offers',
      description_fields: {
        products_count: '',
        discount_percentage: '',
      },
    },
    {
      offer_ids: ['default_first_time_1'],
      name: 'First Time Offer',
      used_this_month: 0,
      state: 'Inactive',
      type: 'default_first_time_offer',
      offer_url: 'https://stunion.cat-ops.ekanek.app/settings/default_offers',
      description_fields: {
        extra_absolute_discount: '',
        cashback_amount: '',
        min_order_value: '',
      },
    },
    {
      offer_ids: ['default_repeat_1'],
      name: 'Repeat Offer',
      used_this_month: 0,
      state: 'Inactive',
      type: 'default_repeat_offer',
      offer_url: 'https://stunion.cat-ops.ekanek.app/settings/default_offers',
      description_fields: {
        extra_percentage_discount: '',
        upto_days: '',
      },
    },
    {
      offer_ids: ['default_prepaid_1'],
      name: 'Prepaid Offer',
      used_this_month: 0,
      state: 'Inactive',
      type: 'default_prepaid_offer',
      offer_url: 'https://stunion.cat-ops.ekanek.app/settings/default_offers',
      description_fields: {
        extra_percentage_discount: '',
      },
    },
    {
      offer_ids: ['default_wallet_1'],
      name: 'Wallet Offer',
      used_this_month: 0,
      state: 'Inactive',
      type: 'default_wallet_offer',
      offer_url: 'https://stunion.cat-ops.ekanek.app/settings/default_offers',
      description_fields: {
        cashback_amount: '',
        min_order_value: '',
      },
    },
  ];

  const filteredOffers = offers.filter((offer) => {
    if (selectedFilter === 'All') return true;
    return offer.state.toLowerCase() === selectedFilter.toLowerCase();
  });

  const resourceName = {
    singular: 'offer',
    plural: 'offers',
  };

  const RenderDescription = (type, descriptionFields) => {
    switch (type) {
      case 'default_flash_deal_offer':
        return (
          <Text>
            <input
              className='inputStyle'
              defaultValue={descriptionFields?.extra_discount || ''}
              disabled
            />{' '}
            % extra discount on{' '}
            <input
              className='inputStyle'
              defaultValue={descriptionFields?.products_count || ''}
              disabled
            />{' '}
            excluding products{' '}
            <input
              className='longInputStyle'
              defaultValue={
                descriptionFields?.excluding_list_sku_names?.join(', ') || ''
              }
              disabled
            />
          </Text>
        );

      case 'default_combo_builder_offer':
        return (
          <Text>
            Buy{' '}
            <input
              type='text'
              className='inputStyle'
              defaultValue={descriptionFields?.products_count || ''}
              disabled
            />{' '}
            products at{' '}
            <input
              type='text'
              className='inputStyle'
              defaultValue={descriptionFields?.discount_percentage || ''}
              disabled
            />{' '}
            % off
          </Text>
        );

      case 'default_first_time_offer':
        return (
          <Text>
            Extra ₹{' '}
            <input
              type='text'
              className='inputStyle'
              defaultValue={descriptionFields?.extra_absolute_discount || ''}
              disabled
            />{' '}
            off +{' '}
            <input
              type='text'
              className='inputStyle'
              defaultValue={descriptionFields?.cashback_amount || ''}
              disabled
            />{' '}
            cashback on minimum order of ₹{' '}
            <input
              type='text'
              className='inputStyle'
              defaultValue={descriptionFields?.min_order_value || ''}
              disabled
            />
          </Text>
        );

      case 'default_repeat_offer':
        return (
          <Text>
            Extra{' '}
            <input
              type='text'
              className='inputStyle'
              defaultValue={descriptionFields?.extra_percentage_discount || ''}
              disabled
            />{' '}
            % off on previously bought products for up to{' '}
            <input
              type='text'
              className='inputStyle'
              defaultValue={descriptionFields?.upto_days || ''}
              disabled
            />{' '}
            days
          </Text>
        );

      case 'default_prepaid_offer':
        return (
          <Text>
            Extra{' '}
            <input
              type='text'
              className='inputStyle'
              defaultValue={descriptionFields?.extra_percentage_discount || ''}
              disabled
            />{' '}
            % off on prepaid only orders
          </Text>
        );

      case 'default_wallet_offer':
        return (
          <Text>
            ₹{' '}
            <input
              type='text'
              className='inputStyle'
              defaultValue={descriptionFields?.cashback_amount || ''}
              disabled
            />{' '}
            cashback on minimum order of ₹{' '}
            <input
              type='text'
              className='inputStyle'
              defaultValue={descriptionFields?.min_order_value || ''}
              disabled
            />
          </Text>
        );

      default:
        return <Text>No specific offer description available</Text>;
    }
  };

  const rowMarkup = filteredOffers.map(
    (
      {
        offer_ids,
        name,
        used_this_month,
        state,
        type,
        offer_url,
        description_fields,
      },
      index,
    ) => (
      <IndexTable.Row id={offer_ids[0]} key={offer_ids[0]} position={index}>
        <IndexTable.Cell>
          <Text as='span'>{index + 1}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text as='span'>{offer_ids[0]}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text as='span'>{name}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <div className='descriptionStyle'>
            {RenderDescription(type, description_fields)}
          </div>{' '}
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text as='span'>{used_this_month}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text as='span'>{state}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Button onClick={() => window.open(offer_url, '_blank')}>Edit</Button>
        </IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <Page>
      <div style={{ paddingBottom: 12 }}>
        <Text variant='headingLg' as='h5' margin='12'>
          Default Offers
        </Text>
      </div>
      <LegacyCard>
        <Box padding={400}>
          <ButtonGroup>
            <Button
              pressed={selectedFilter === 'All'}
              onClick={() => setSelectedFilter('All')}
            >
              All offers
            </Button>
            <Button
              pressed={selectedFilter === 'Active'}
              onClick={() => setSelectedFilter('Active')}
            >
              Active
            </Button>
            <Button
              pressed={selectedFilter === 'Inactive'}
              onClick={() => setSelectedFilter('Inactive')}
            >
              Inactive
            </Button>
          </ButtonGroup>
        </Box>
        <IndexTable
          condensed={useBreakpoints().smDown}
          resourceName={resourceName}
          itemCount={filteredOffers.length}
          headings={[
            { title: 'SNo' },
            { title: 'Offer ID' },
            { title: 'Name' },
            { title: 'Description' },
            { title: 'Used This Month' },
            { title: 'State' },
            { title: 'Actions' },
          ]}
          selectable={false}
        >
          {rowMarkup}
        </IndexTable>
      </LegacyCard>
    </Page>
  );
}

export default IndexTableWithoutCheckboxesExample;
