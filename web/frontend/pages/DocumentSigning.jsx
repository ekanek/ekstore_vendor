import { useState, useEffect } from 'react';
import {
  Button,
  LegacyCard,
  Modal,
  Toast,
  Form,
  FormLayout,
  DropZone,
  LegacyStack,
  Thumbnail,
} from '@shopify/polaris';
import axios from 'axios';
import { useVendorStatus } from '../components/providers/VendorStatusProvider';

export default function DocumentSigning({ onComplete }) {
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEsignStatusModal, setShowEsignStatusModal] = useState(false);
  const [toast, setToast] = useState({
    active: false,
    content: '',
    error: false,
  });
  const [documentUploadStatus, setDocumentUploadStatus] = useState(false);
  const [esignStatus, setEsignStatus] = useState(false);
  const [esignSent, setEsignSent] = useState(false);
  const [files, setFiles] = useState({
    gst_certificate: null,
    pan_card_copy: null,
    msme_certificate: null,
  });
  const [uploadedStatus, setUploadedStatus] = useState({
    gst_certificate_present: false,
    pan_card_copy_present: false,
  });
  const { vendorStatus } = useVendorStatus();

  useEffect(() => {
    const checkEsignStatus = async () => {
      try {
        const response = await axios.get(
          'https://toddler-egypt-qualified-australia.trycloudflare.com/shopify_sales_channel/zoho_esign_status',
          { headers: { shop: vendorStatus.shop } },
        );
        const {
          documents_status,
          status,
          gst_certificate_present,
          pan_card_copy_present,
        } = response.data;

        if (response.status === 200) {
          setDocumentUploadStatus(documents_status);
          setEsignStatus(status);
          setUploadedStatus({
            gst_certificate_present,
            pan_card_copy_present,
          });
          if (status) {
            setEsignSent(true); // If eSigned, assume sent
          } else if (documents_status) {
            setEsignSent(false); // Documents uploaded but not sent yet
          }
        }
      } catch (error) {
        console.error('Error checking e-sign status on mount:', error);
      }
    };

    if (vendorStatus.shop) {
      checkEsignStatus();
    }
  }, [vendorStatus.shop]);

  const handleSendDocument = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://toddler-egypt-qualified-australia.trycloudflare.com/shopify_sales_channel/send_document_for_esign',
        {},
        { headers: { shop: vendorStatus.shop } },
      );
      if (response.status === 200) {
        setToast({
          active: true,
          content: 'Document sent successfully!',
          error: false,
        });
        setEsignSent(true);
      }
    } catch (error) {
      setToast({
        active: true,
        content: 'Failed to send document',
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckEsignStatus = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        'https://toddler-egypt-qualified-australia.trycloudflare.com/shopify_sales_channel/zoho_esign_status',
        { headers: { shop: vendorStatus.shop } },
      );
      const { status } = response.data;

      if (response.status === 200) {
        setEsignStatus(status);
        setShowEsignStatusModal(true);
      }
    } catch (error) {
      setToast({
        active: true,
        content: 'Failed to check eSign status',
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileDrop = (field) => (_dropFiles, acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFiles((prev) => ({ ...prev, [field]: acceptedFiles[0] }));
    }
  };

  const handleUploadSubmit = async () => {
    if (!files.gst_certificate || !files.pan_card_copy) {
      setToast({
        active: true,
        content: 'Please upload GST Certificate and PAN Card Copy',
        error: true,
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('gst_certificate_copy', files.gst_certificate);
    formData.append('pan_card_copy', files.pan_card_copy);
    if (files.msme_certificate) {
      formData.append('msme_certificate_copy', files.msme_certificate);
    }

    try {
      const response = await axios.post(
        'https://toddler-egypt-qualified-australia.trycloudflare.com/shopify_sales_channel/ekstore_registered_vendors/upload_documents',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            shop: vendorStatus.shop,
          },
        },
      );
      if (response.status === 200) {
        setToast({
          active: true,
          content: 'Documents uploaded successfully!',
          error: false,
        });
        setShowUploadModal(false);
        setDocumentUploadStatus(true);
        setUploadedStatus({
          gst_certificate_present: true,
          pan_card_copy_present: true,
        });
      }
    } catch (error) {
      setToast({
        active: true,
        content: 'Failed to upload documents',
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleToast = () => {
    setToast((prev) => ({ ...prev, active: false }));
  };

  return (
    <>
      <LegacyCard sectioned>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
            Thank you for completing the Onboarding 🎉
          </h2>
          <p style={{ marginBottom: '24px' }}>
            {!documentUploadStatus
              ? 'Please upload documents to complete onboarding'
              : 'Documents uploaded successfully! Please proceed with eSignature'}
          </p>
          <div
            style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}
          >
            {!documentUploadStatus && (
              <Button
                primary
                onClick={() => setShowUploadModal(true)}
                loading={loading}
              >
                Upload Documents
              </Button>
            )}
            {documentUploadStatus && !esignStatus && (
              <Button
                primary
                onClick={
                  esignSent ? handleCheckEsignStatus : handleSendDocument
                }
                loading={loading}
              >
                {esignSent
                  ? 'Check eSign Status'
                  : 'Send Documents for eSignature'}
              </Button>
            )}
            {esignStatus && (
              <Button primary onClick={onComplete} loading={loading}>
                Complete Registration
              </Button>
            )}
          </div>
        </div>
      </LegacyCard>

      <Modal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title='Upload Required Documents'
        primaryAction={{
          content: 'Submit',
          onAction: handleUploadSubmit,
          loading: loading,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setShowUploadModal(false),
          },
        ]}
      >
        <Modal.Section>
          <Form>
            <FormLayout>
              {!uploadedStatus.gst_certificate_present && (
                <DropZone
                  label='GST Certificate *'
                  onDrop={handleFileDrop('gst_certificate')}
                  allowMultiple={false}
                >
                  {files.gst_certificate ? (
                    <LegacyStack>
                      <Thumbnail
                        source={window.URL.createObjectURL(
                          files.gst_certificate,
                        )}
                        alt='GST Certificate'
                      />
                      <div>{files.gst_certificate.name}</div>
                    </LegacyStack>
                  ) : (
                    <DropZone.FileUpload />
                  )}
                </DropZone>
              )}
              {!uploadedStatus.pan_card_copy_present && (
                <DropZone
                  label='PAN Card Copy *'
                  onDrop={handleFileDrop('pan_card_copy')}
                  allowMultiple={false}
                >
                  {files.pan_card_copy ? (
                    <LegacyStack>
                      <Thumbnail
                        source={window.URL.createObjectURL(files.pan_card_copy)}
                        alt='PAN Card Copy'
                      />
                      <div>{files.pan_card_copy.name}</div>
                    </LegacyStack>
                  ) : (
                    <DropZone.FileUpload />
                  )}
                </DropZone>
              )}
              {!files.msme_certificate && (
                <DropZone
                  label='MSME Certificate (Optional)'
                  onDrop={handleFileDrop('msme_certificate')}
                  allowMultiple={false}
                >
                  {files.msme_certificate ? (
                    <LegacyStack>
                      <Thumbnail
                        source={window.URL.createObjectURL(
                          files.msme_certificate,
                        )}
                        alt='MSME Certificate'
                      />
                      <div>{files.msme_certificate.name}</div>
                    </LegacyStack>
                  ) : (
                    <DropZone.FileUpload />
                  )}
                </DropZone>
              )}
            </FormLayout>
          </Form>
        </Modal.Section>
      </Modal>

      <Modal
        open={showEsignStatusModal}
        onClose={() => setShowEsignStatusModal(false)}
        title='eSign Status'
        primaryAction={
          esignStatus
            ? {
                content: 'Proceed Further',
                onAction: () => {
                  setShowEsignStatusModal(false);
                  onComplete();
                },
              }
            : {
                content: 'Close',
                onAction: () => setShowEsignStatusModal(false),
              }
        }
      >
        <Modal.Section>
          <p>
            {esignStatus
              ? 'Thank you for registering!'
              : 'eSign status is pending'}
          </p>
        </Modal.Section>
      </Modal>

      {toast.active && (
        <Toast
          content={toast.content}
          error={toast.error}
          onDismiss={toggleToast}
          duration={3000}
        />
      )}
    </>
  );
}
